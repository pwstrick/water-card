import * as THREE from 'three'
import { getCardImageLayout } from '../../config/cardImageLayouts'

// 相机沿 Z 轴与卡片的距离：数值越小，卡片在视口中越大。BASE_DISTANCE 对应界面显示的 100%。
const BASE_DISTANCE = 5.6
// 限制相机距离，避免卡片放大后穿过相机，或缩小到难以操作。
const MIN_DISTANCE = 1
const MAX_DISTANCE = 8
// 点击一次缩放按钮调整约 16%；滚轮和双指缩放也复用这个倍率。
const ZOOM_FACTOR = 1.16
// 指针每移动 1px 转换成的旋转弧度，数值越大拖动翻转越灵敏。
const ROTATE_SPEED = 0.008
// 旋转/位移与相机距离采用不同量级的静止阈值；低于阈值后停止 RAF，避免空闲占用 GPU。
const MOTION_EPSILON = 0.0001
const DISTANCE_EPSILON = 0.001

// 对外暴露用户能理解的缩放倍率，内部仍使用相机距离计算。
export const CARD_ZOOM_LIMITS = {
  min: BASE_DISTANCE / MAX_DISTANCE,
  max: BASE_DISTANCE / MIN_DISTANCE,
}

const normalize = (value) => ((value % 360) + 360) % 360

export function createThreeCardScene({
  mount,
  card,
  interactionModeRef,
  onAngleChange,
  onZoomChange,
  onFacingBackChange,
  onDraggingChange,
  onLoadStateChange,
}) {
  let disposed = false
  let frame = 0
  let cameraDistance = BASE_DISTANCE
  let targetDistance = BASE_DISTANCE
  let lastAngle = -1
  let lastZoom = -1
  let lastFacingBack = false
  const pointers = new Map()
  const drag = {
    active: false,
    mode: 'rotate',
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
  }
  const pinch = { active: false, distance: 0, cameraDistance: BASE_DISTANCE, centerX: 0, centerY: 0 }
  const pan = { x: 0, y: 0, targetX: 0, targetY: 0 }
  // current/target 分离用于实现旋转、位移和缩放的缓动。
  const rotation = {
    x: THREE.MathUtils.degToRad(-3),
    y: 0,
    targetX: THREE.MathUtils.degToRad(-3),
    targetY: 0,
  }

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 30)
  camera.position.set(0, 0.12, BASE_DISTANCE)

  // 下载功能会直接读取 canvas；改用 RenderTarget 前不能关闭 preserveDrawingBuffer。
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  mount.appendChild(renderer.domElement)

  const group = new THREE.Group()
  group.rotation.x = rotation.x
  scene.add(group)

  const width = 2
  const height = 2.9
  const depth = 0.018
  const radius = 0.095
  const shape = createRoundedRect(width, height, radius)
  const bodyGeometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.008,
    bevelThickness: 0.004,
    curveSegments: 10,
  })
  bodyGeometry.translate(0, 0, -depth / 2)
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xb8ad94 })
  const geometries = [bodyGeometry]
  const materials = [edgeMaterial]
  group.add(new THREE.Mesh(bodyGeometry, edgeMaterial))

  // 正反面使用两套 UV 裁切，但共享一张 GPU 纹理，避免同一大图上传两次。
  const imageLayout = getCardImageLayout(card.images.layout)
  const frontFaceGeometry = createFaceGeometry(shape, width, height, imageLayout.front)
  const backFaceGeometry = createFaceGeometry(shape, width, height, imageLayout.back)
  geometries.push(frontFaceGeometry, backFaceGeometry)
  const textureLoader = new THREE.TextureLoader()
  let cardTexture = null

  loadCardTexture(textureLoader, renderer, card.images.source)
    .then((texture) => {
      // 人物切换可能发生在图片返回之前，此时只释放资源，不再操作已经卸载的场景。
      if (disposed) {
        texture.dispose()
        return
      }
      cardTexture = texture
      const frontMaterial = new THREE.MeshBasicMaterial({ map: cardTexture, side: THREE.FrontSide })
      const backMaterial = new THREE.MeshBasicMaterial({ map: cardTexture, side: THREE.FrontSide })
      materials.push(frontMaterial, backMaterial)
      const front = new THREE.Mesh(frontFaceGeometry, frontMaterial)
      front.position.z = depth / 2 + 0.005
      group.add(front)

      const back = new THREE.Mesh(backFaceGeometry, backMaterial)
      back.position.z = -depth / 2 - 0.005
      back.rotation.y = Math.PI
      group.add(back)
      onLoadStateChange('ready')
      requestRender()
    })
    .catch(() => {
      if (!disposed) onLoadStateChange('error')
    })

  const updateReadout = () => {
    const nextAngle = Math.round(normalize(THREE.MathUtils.radToDeg(rotation.y)))
    const nextZoom = BASE_DISTANCE / cameraDistance
    const nextFacingBack = Math.cos(rotation.x) * Math.cos(rotation.y) < 0
    // 仅在显示值真正变化时同步 React，避免动画期间每帧触发组件渲染。
    if (nextAngle !== lastAngle) {
      lastAngle = nextAngle
      onAngleChange(nextAngle)
    }
    if (Math.abs(nextZoom - lastZoom) > 0.01) {
      lastZoom = nextZoom
      onZoomChange(nextZoom)
    }
    if (nextFacingBack !== lastFacingBack) {
      lastFacingBack = nextFacingBack
      onFacingBackChange(nextFacingBack)
    }
  }

  // 只有交互、惯性或目标差值仍存在时，才继续下一帧。
  const hasMotion = () => (
    drag.active
    || pinch.active
    || Math.abs(drag.velocityX) > MOTION_EPSILON
    || Math.abs(drag.velocityY) > MOTION_EPSILON
    || Math.abs(rotation.targetX - rotation.x) > MOTION_EPSILON
    || Math.abs(rotation.targetY - rotation.y) > MOTION_EPSILON
    || Math.abs(pan.targetX - pan.x) > MOTION_EPSILON
    || Math.abs(pan.targetY - pan.y) > MOTION_EPSILON
    || Math.abs(targetDistance - cameraDistance) > DISTANCE_EPSILON
  )

  const animate = () => {
    frame = 0
    if (disposed) return
    if (!drag.active && !pinch.active) {
      rotation.targetX += drag.velocityX
      rotation.targetY += drag.velocityY
      drag.velocityX *= 0.86
      drag.velocityY *= 0.86
      if (Math.abs(drag.velocityX) <= MOTION_EPSILON) drag.velocityX = 0
      if (Math.abs(drag.velocityY) <= MOTION_EPSILON) drag.velocityY = 0
    }
    rotation.x += (rotation.targetX - rotation.x) * (drag.active ? 0.55 : 0.2)
    rotation.y += (rotation.targetY - rotation.y) * (drag.active ? 0.55 : 0.2)
    group.rotation.set(rotation.x, rotation.y, 0, 'XYZ')
    pan.x += (pan.targetX - pan.x) * 0.28
    pan.y += (pan.targetY - pan.y) * 0.28
    group.position.set(pan.x, pan.y, 0)

    cameraDistance += (targetDistance - cameraDistance) * 0.16
    camera.position.set(0, 0.12, cameraDistance)
    camera.lookAt(0, 0, 0)
    updateReadout()
    renderer.render(scene, camera)
    if (hasMotion()) frame = requestAnimationFrame(animate)
  }

  const requestRender = () => {
    // 多个输入事件可能在同一帧发生，只保留一个 RAF。
    if (disposed || frame) return
    frame = requestAnimationFrame(animate)
  }

  const resize = () => {
    const { width: nextWidth, height: nextHeight } = mount.getBoundingClientRect()
    if (!nextWidth || !nextHeight) return
    camera.aspect = nextWidth / nextHeight
    camera.updateProjectionMatrix()
    renderer.setSize(nextWidth, nextHeight)
    requestRender()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(mount)
  resize()

  const moveToAngle = (degrees) => {
    const currentDegrees = normalize(THREE.MathUtils.radToDeg(rotation.y))
    let delta = degrees - currentDegrees
    // 始终选择最短旋转方向，避免正反面按钮让卡片绕远路。
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    rotation.targetY = rotation.y + THREE.MathUtils.degToRad(delta)
    rotation.targetX = 0
    drag.velocityX = 0
    drag.velocityY = 0
    requestRender()
  }

  const setDistance = (distance) => {
    targetDistance = THREE.MathUtils.clamp(distance, MIN_DISTANCE, MAX_DISTANCE)
    if (targetDistance >= BASE_DISTANCE) {
      pan.targetX = 0
      pan.targetY = 0
    } else {
      const zoomScale = BASE_DISTANCE / targetDistance
      const maxPanX = (zoomScale - 1) * 1.3
      const maxPanY = (zoomScale - 1) * 1.9
      pan.targetX = THREE.MathUtils.clamp(pan.targetX, -maxPanX, maxPanX)
      pan.targetY = THREE.MathUtils.clamp(pan.targetY, -maxPanY, maxPanY)
    }
    requestRender()
  }

  const panByPixels = (dx, dy) => {
    const viewportHeight = mount.clientHeight || 590
    // 将屏幕像素位移换算到相机当前距离下的世界坐标。
    const worldPerPixel = (2 * targetDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / viewportHeight
    const zoomScale = BASE_DISTANCE / targetDistance
    const maxPanX = Math.max(0, (zoomScale - 1) * 1.3)
    const maxPanY = Math.max(0, (zoomScale - 1) * 1.9)
    pan.targetX = THREE.MathUtils.clamp(pan.targetX + dx * worldPerPixel, -maxPanX, maxPanX)
    pan.targetY = THREE.MathUtils.clamp(pan.targetY - dy * worldPerPixel, -maxPanY, maxPanY)
    requestRender()
  }

  const pointerDistance = () => {
    const [first, second] = [...pointers.values()]
    return Math.hypot(second.x - first.x, second.y - first.y)
  }

  const beginDrag = ({ x, y }, forceRotate = false) => {
    drag.active = true
    drag.mode = targetDistance < BASE_DISTANCE / 1.03 && !forceRotate ? interactionModeRef.current : 'rotate'
    drag.lastX = x
    drag.lastY = y
    drag.velocityX = 0
    drag.velocityY = 0
    onDraggingChange(true)
    requestRender()
  }

  const onPointerDown = (event) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    renderer.domElement.setPointerCapture(event.pointerId)
    if (pointers.size === 2) {
      drag.active = false
      pinch.active = true
      pinch.distance = pointerDistance()
      pinch.cameraDistance = targetDistance
      const [first, second] = [...pointers.values()]
      pinch.centerX = (first.x + second.x) / 2
      pinch.centerY = (first.y + second.y) / 2
      onDraggingChange(false)
    } else if (pointers.size === 1) {
      beginDrag({ x: event.clientX, y: event.clientY }, event.shiftKey)
    }
  }

  const onPointerMove = (event) => {
    if (!pointers.has(event.pointerId)) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pinch.active && pointers.size >= 2) {
      const distance = pointerDistance()
      if (pinch.distance > 0) setDistance(pinch.cameraDistance * (pinch.distance / distance))
      const [first, second] = [...pointers.values()]
      const centerX = (first.x + second.x) / 2
      const centerY = (first.y + second.y) / 2
      panByPixels(centerX - pinch.centerX, centerY - pinch.centerY)
      pinch.centerX = centerX
      pinch.centerY = centerY
      return
    }
    if (!drag.active) return

    const dx = event.clientX - drag.lastX
    const dy = event.clientY - drag.lastY
    if (drag.mode === 'pan') {
      panByPixels(dx, dy)
    } else {
      rotation.targetY += dx * ROTATE_SPEED
      rotation.targetX += dy * ROTATE_SPEED
      drag.velocityY = dx * ROTATE_SPEED * 0.18
      drag.velocityX = dy * ROTATE_SPEED * 0.18
      requestRender()
    }
    drag.lastX = event.clientX
    drag.lastY = event.clientY
  }

  const onPointerEnd = (event) => {
    pointers.delete(event.pointerId)
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId)
    }
    if (pointers.size < 2) pinch.active = false
    if (pointers.size === 1) {
      const [remaining] = pointers.values()
      beginDrag(remaining)
    } else if (pointers.size === 0) {
      drag.active = false
      onDraggingChange(false)
    }
  }

  const onWheel = (event) => {
    event.preventDefault()
    setDistance(targetDistance * Math.exp(event.deltaY * 0.001))
  }

  const onDoubleClick = () => moveToAngle(lastFacingBack ? 0 : 180)
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('pointerup', onPointerEnd)
  renderer.domElement.addEventListener('pointercancel', onPointerEnd)
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false })
  renderer.domElement.addEventListener('dblclick', onDoubleClick)

  return {
    goTo: moveToAngle,
    changeZoom: (direction) => {
      setDistance(direction > 0 ? targetDistance / ZOOM_FACTOR : targetDistance * ZOOM_FACTOR)
    },
    reset: () => setDistance(BASE_DISTANCE),
    download: () => downloadCanvas(renderer, scene, camera, card, lastAngle, () => disposed),
    dispose: () => {
      // Three.js 不会自动释放 GPU 对象；切换人物时必须逐项销毁。
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerEnd)
      renderer.domElement.removeEventListener('pointercancel', onPointerEnd)
      renderer.domElement.removeEventListener('wheel', onWheel)
      renderer.domElement.removeEventListener('dblclick', onDoubleClick)
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      cardTexture?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}

function createRoundedRect(width, height, radius) {
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

function normalizeFaceUvs(geometry, width, height) {
  const uv = geometry.attributes.uv
  const position = geometry.attributes.position
  for (let index = 0; index < uv.count; index += 1) {
    uv.setXY(index, position.getX(index) / width + 0.5, position.getY(index) / height + 0.5)
  }
  uv.needsUpdate = true
}

function createFaceGeometry(shape, width, height, layout) {
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

async function loadCardTexture(textureLoader, renderer, url) {
  const texture = await textureLoader.loadAsync(url)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return texture
}

function downloadCanvas(renderer, scene, camera, card, angle, isDisposed) {
  renderer.render(scene, camera)
  const fileName = `水浒卡-${card.name}${card.edition ? `-${card.edition}` : ''}-${String(angle).padStart(3, '0')}度.png`
  renderer.domElement.toBlob((blob) => {
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
