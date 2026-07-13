import * as THREE from 'three'

const BASE_DISTANCE = 5.6
const MIN_DISTANCE = 1
const MAX_DISTANCE = 8
const ZOOM_FACTOR = 1.16
const ROTATE_SPEED = 0.008
const MOTION_EPSILON = 0.0001
const DISTANCE_EPSILON = 0.001

export const CARD_ZOOM_LIMITS = {
  min: BASE_DISTANCE / MAX_DISTANCE,
  max: BASE_DISTANCE / MIN_DISTANCE,
}

const normalize = (value) => ((value % 360) + 360) % 360

export function createCardMotion({
  camera,
  group,
  mount,
  onAngleChange,
  onFacingBackChange,
  onZoomChange,
  requestRender,
}) {
  // current/target 分离用于缓动；对外命令只修改 target，update 在 RAF 中推进 current。
  let cameraDistance = BASE_DISTANCE
  let targetDistance = BASE_DISTANCE
  let lastAngle = -1
  let lastZoom = -1
  let lastFacingBack = false
  let dragging = false
  let pinching = false
  const velocity = { x: 0, y: 0 }
  const pan = { x: 0, y: 0, targetX: 0, targetY: 0 }
  const rotation = {
    x: THREE.MathUtils.degToRad(-3),
    y: 0,
    targetX: THREE.MathUtils.degToRad(-3),
    targetY: 0,
  }

  group.rotation.x = rotation.x
  camera.position.set(0, 0.12, BASE_DISTANCE)

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

  const setDistance = (distance) => {
    targetDistance = THREE.MathUtils.clamp(distance, MIN_DISTANCE, MAX_DISTANCE)
    // 缩回 100% 以下时回正卡片位置，防止上一次放大留下不可见偏移。
    if (targetDistance >= BASE_DISTANCE) {
      pan.targetX = 0
      pan.targetY = 0
    } else {
      const zoomScale = BASE_DISTANCE / targetDistance
      pan.targetX = THREE.MathUtils.clamp(pan.targetX, -(zoomScale - 1) * 1.3, (zoomScale - 1) * 1.3)
      pan.targetY = THREE.MathUtils.clamp(pan.targetY, -(zoomScale - 1) * 1.9, (zoomScale - 1) * 1.9)
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

  const moveToAngle = (degrees) => {
    const currentDegrees = normalize(THREE.MathUtils.radToDeg(rotation.y))
    let delta = degrees - currentDegrees
    // 始终选择最短旋转方向，避免正反面按钮让卡片绕远路。
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    rotation.targetY = rotation.y + THREE.MathUtils.degToRad(delta)
    rotation.targetX = 0
    velocity.x = 0
    velocity.y = 0
    requestRender()
  }

  return {
    beginDrag: () => {
      dragging = true
      velocity.x = 0
      velocity.y = 0
      requestRender()
    },
    endDrag: () => { dragging = false },
    setPinching: (active) => { pinching = active },
    getTargetDistance: () => targetDistance,
    getAngle: () => lastAngle,
    isFacingBack: () => lastFacingBack,
    isZoomedIn: () => targetDistance < BASE_DISTANCE / 1.03,
    moveToAngle,
    panByPixels,
    rotateByPixels: (dx, dy) => {
      rotation.targetY += dx * ROTATE_SPEED
      rotation.targetX += dy * ROTATE_SPEED
      velocity.y = dx * ROTATE_SPEED * 0.18
      velocity.x = dy * ROTATE_SPEED * 0.18
      requestRender()
    },
    setDistance,
    changeZoom: (direction) => {
      setDistance(direction > 0 ? targetDistance / ZOOM_FACTOR : targetDistance * ZOOM_FACTOR)
    },
    reset: () => setDistance(BASE_DISTANCE),
    update: () => {
      if (!dragging && !pinching) {
        rotation.targetX += velocity.x
        rotation.targetY += velocity.y
        velocity.x *= 0.86
        velocity.y *= 0.86
        if (Math.abs(velocity.x) <= MOTION_EPSILON) velocity.x = 0
        if (Math.abs(velocity.y) <= MOTION_EPSILON) velocity.y = 0
      }
      rotation.x += (rotation.targetX - rotation.x) * (dragging ? 0.55 : 0.2)
      rotation.y += (rotation.targetY - rotation.y) * (dragging ? 0.55 : 0.2)
      group.rotation.set(rotation.x, rotation.y, 0, 'XYZ')
      pan.x += (pan.targetX - pan.x) * 0.28
      pan.y += (pan.targetY - pan.y) * 0.28
      group.position.set(pan.x, pan.y, 0)
      cameraDistance += (targetDistance - cameraDistance) * 0.16
      camera.position.set(0, 0.12, cameraDistance)
      camera.lookAt(0, 0, 0)
      updateReadout()
    },
    hasMotion: () => (
      dragging
      || pinching
      || Math.abs(velocity.x) > MOTION_EPSILON
      || Math.abs(velocity.y) > MOTION_EPSILON
      || Math.abs(rotation.targetX - rotation.x) > MOTION_EPSILON
      || Math.abs(rotation.targetY - rotation.y) > MOTION_EPSILON
      || Math.abs(pan.targetX - pan.x) > MOTION_EPSILON
      || Math.abs(pan.targetY - pan.y) > MOTION_EPSILON
      || Math.abs(targetDistance - cameraDistance) > DISTANCE_EPSILON
    ),
  }
}
