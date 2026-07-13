import * as THREE from 'three'

export function createRoundedCardShape(width, height, radius) {
  const shape = new THREE.Shape()
  const left = -width / 2
  const bottom = -height / 2
  shape.moveTo(left + radius, bottom)
  shape.lineTo(left + width - radius, bottom)
  shape.absarc(left + width - radius, bottom + radius, radius, -Math.PI / 2, 0)
  shape.lineTo(left + width, bottom + height - radius)
  shape.absarc(left + width - radius, bottom + height - radius, radius, 0, Math.PI / 2)
  shape.lineTo(left + radius, bottom + height)
  shape.absarc(left + radius, bottom + height - radius, radius, Math.PI / 2, Math.PI)
  shape.lineTo(left, bottom + radius)
  shape.absarc(left + radius, bottom + radius, radius, Math.PI, Math.PI * 1.5)
  return shape
}

export function createCardFaceGeometry(shape, width, height, layout) {
  const geometry = new THREE.ShapeGeometry(shape, 10)
  normalizeFaceUvs(geometry, width, height)
  const uv = geometry.attributes.uv
  const [repeatX, repeatY] = layout.repeat
  const [offsetX, offsetY] = layout.offset

  // 将原先 Texture.repeat/offset 的变换烘焙进 UV，从而让两个面安全共享纹理。
  for (let index = 0; index < uv.count; index += 1) {
    uv.setXY(
      index,
      uv.getX(index) * repeatX + offsetX,
      uv.getY(index) * repeatY + offsetY,
    )
  }
  uv.needsUpdate = true
  return geometry
}

export async function loadCardTexture(textureLoader, renderer, url, { maxAnisotropy } = {}) {
  const texture = await textureLoader.loadAsync(url)
  texture.colorSpace = THREE.SRGBColorSpace
  // 桌面端使用设备能力，移动端可传入较低上限以控制采样成本和发热。
  texture.anisotropy = Math.min(
    renderer.capabilities.getMaxAnisotropy(),
    maxAnisotropy ?? Number.POSITIVE_INFINITY,
  )
  return texture
}

function normalizeFaceUvs(geometry, width, height) {
  const uv = geometry.attributes.uv
  const position = geometry.attributes.position
  for (let index = 0; index < uv.count; index += 1) {
    uv.setXY(index, position.getX(index) / width + 0.5, position.getY(index) / height + 0.5)
  }
  uv.needsUpdate = true
}
