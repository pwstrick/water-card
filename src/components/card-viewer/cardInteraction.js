export function bindCardInteraction({
  element,
  interactionModeRef,
  motion,
  onDraggingChange,
}) {
  // Pointer Events 同时覆盖鼠标和触控；Map 用于在单指拖动与双指缩放间无缝切换。
  const pointers = new Map()
  const drag = { active: false, mode: 'rotate', lastX: 0, lastY: 0 }
  const pinch = { active: false, distance: 0, cameraDistance: 0, centerX: 0, centerY: 0 }

  const pointerDistance = () => {
    const [first, second] = [...pointers.values()]
    return Math.hypot(second.x - first.x, second.y - first.y)
  }

  const beginDrag = ({ x, y }, forceRotate = false) => {
    drag.active = true
    drag.mode = motion.isZoomedIn() && !forceRotate ? interactionModeRef.current : 'rotate'
    drag.lastX = x
    drag.lastY = y
    motion.beginDrag()
    onDraggingChange(true)
  }

  const onPointerDown = (event) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    element.setPointerCapture(event.pointerId)
    if (pointers.size === 2) {
      // 第二根手指落下后停止单指惯性，记录双指初始距离和中心点。
      drag.active = false
      motion.endDrag()
      pinch.active = true
      motion.setPinching(true)
      pinch.distance = pointerDistance()
      pinch.cameraDistance = motion.getTargetDistance()
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
      if (pinch.distance > 0) motion.setDistance(pinch.cameraDistance * (pinch.distance / distance))
      const [first, second] = [...pointers.values()]
      const centerX = (first.x + second.x) / 2
      const centerY = (first.y + second.y) / 2
      motion.panByPixels(centerX - pinch.centerX, centerY - pinch.centerY)
      pinch.centerX = centerX
      pinch.centerY = centerY
      return
    }
    if (!drag.active) return

    const dx = event.clientX - drag.lastX
    const dy = event.clientY - drag.lastY
    if (drag.mode === 'pan') motion.panByPixels(dx, dy)
    else motion.rotateByPixels(dx, dy)
    drag.lastX = event.clientX
    drag.lastY = event.clientY
  }

  const onPointerEnd = (event) => {
    pointers.delete(event.pointerId)
    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
    if (pointers.size < 2) {
      pinch.active = false
      motion.setPinching(false)
    }
    if (pointers.size === 1) {
      // 双指抬起一根后继续单指拖动，重新设置起点可避免卡片瞬移。
      const [remaining] = pointers.values()
      beginDrag(remaining)
    } else if (pointers.size === 0) {
      drag.active = false
      motion.endDrag()
      onDraggingChange(false)
    }
  }

  const onWheel = (event) => {
    event.preventDefault()
    motion.setDistance(motion.getTargetDistance() * Math.exp(event.deltaY * 0.001))
  }
  const onDoubleClick = () => motion.moveToAngle(motion.isFacingBack() ? 0 : 180)

  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('pointermove', onPointerMove)
  element.addEventListener('pointerup', onPointerEnd)
  element.addEventListener('pointercancel', onPointerEnd)
  element.addEventListener('wheel', onWheel, { passive: false })
  element.addEventListener('dblclick', onDoubleClick)

  return () => {
    element.removeEventListener('pointerdown', onPointerDown)
    element.removeEventListener('pointermove', onPointerMove)
    element.removeEventListener('pointerup', onPointerEnd)
    element.removeEventListener('pointercancel', onPointerEnd)
    element.removeEventListener('wheel', onWheel)
    element.removeEventListener('dblclick', onDoubleClick)
    pointers.clear()
  }
}
