import * as THREE from 'three'
import { flipPixelRows } from '../../utils/imagePixels'

export function exportCardImage({ renderer, scene, camera, card, angle, isDisposed }) {
  if (isDisposed()) return
  const size = renderer.getDrawingBufferSize(new THREE.Vector2())
  const width = Math.max(1, Math.round(size.x))
  const height = Math.max(1, Math.round(size.y))
  // 临时 RenderTarget 只在下载时分配，避免主 renderer 长期开启 preserveDrawingBuffer。
  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    depthBuffer: true,
    stencilBuffer: false,
    samples: Math.min(4, renderer.capabilities.maxSamples ?? 0),
  })
  renderTarget.texture.colorSpace = renderer.outputColorSpace
  const previousRenderTarget = renderer.getRenderTarget()
  const pixels = new Uint8Array(width * height * 4)

  try {
    renderer.setRenderTarget(renderTarget)
    renderer.clear()
    renderer.render(scene, camera)
    renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels)
  } finally {
    renderer.setRenderTarget(previousRenderTarget)
    renderTarget.dispose()
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return
  // WebGL 原点位于左下角，写入 2D Canvas 前需要翻转扫描行。
  context.putImageData(new ImageData(flipPixelRows(pixels, width, height), width, height), 0, 0)

  const fileName = `水浒卡-${card.name}${card.edition ? `-${card.edition}` : ''}-${String(angle).padStart(3, '0')}度.png`
  canvas.toBlob((blob) => {
    if (!blob || isDisposed()) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
