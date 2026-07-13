import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { CARD_ZOOM_LIMITS, createCardMotion } from '../../src/components/card-viewer/cardMotion'

function createMotion() {
  const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 30)
  const group = new THREE.Group()
  const callbacks = {
    onAngleChange: vi.fn(),
    onFacingBackChange: vi.fn(),
    onZoomChange: vi.fn(),
    requestRender: vi.fn(),
  }
  const motion = createCardMotion({
    camera,
    group,
    mount: { clientHeight: 590 },
    ...callbacks,
  })
  return { camera, callbacks, group, motion }
}

describe('createCardMotion', () => {
  it('集中维护缩放边界并将相机距离限制在边界内', () => {
    const { motion } = createMotion()

    motion.setDistance(0)
    expect(motion.getTargetDistance()).toBe(1)
    motion.setDistance(100)
    expect(motion.getTargetDistance()).toBe(8)
    expect(CARD_ZOOM_LIMITS).toEqual({ min: 0.7, max: 5.6 })
  })

  it('更新旋转状态并同步可见角度', () => {
    const { callbacks, group, motion } = createMotion()

    motion.beginDrag()
    motion.rotateByPixels(20, 0)
    motion.update()

    expect(group.rotation.y).toBeGreaterThan(0)
    expect(callbacks.onAngleChange).toHaveBeenCalled()
    expect(motion.hasMotion()).toBe(true)
  })

  it('按最短方向移动到指定角度', () => {
    const { motion } = createMotion()

    motion.moveToAngle(350)
    for (let index = 0; index < 80; index += 1) motion.update()

    expect(motion.getAngle()).toBe(350)
  })
})
