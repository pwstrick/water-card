import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const BASE_DISTANCE = 5.6
const MIN_DISTANCE = 1
const MAX_DISTANCE = 8
const ZOOM_FACTOR = 1.16
const ROTATE_SPEED = 0.008

const TEXTURE_LAYOUTS = {
  standard: {
    front: { repeat: [0.46, 0.942], offset: [0.026, 0.029] },
    back: { repeat: [0.461, 0.942], offset: [0.515, 0.029] },
  },
  flash_prize: {
    front: { repeat: [0.5, 1], offset: [0, 0] },
    back: { repeat: [0.5, 1], offset: [0.5, 0] },
  },
}

const normalize = (value) => ((value % 360) + 360) % 360

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

export default function CardViewer({ card }) {
  const mountRef = useRef(null)
  const viewerRef = useRef(null)
  const interactionModeRef = useRef('pan')
  const [angle, setAngle] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [facingBack, setFacingBack] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [loadState, setLoadState] = useState('loading')
  const [interactionMode, setInteractionMode] = useState('pan')
  const isUcBrowser = /UCWEB|UCBrowser|UC Browser/i.test(navigator.userAgent)

  const goTo = useCallback((nextAngle) => viewerRef.current?.goTo(nextAngle), [])
  const changeZoom = useCallback((direction) => viewerRef.current?.changeZoom(direction), [])
  const resetView = useCallback(() => {
    interactionModeRef.current = 'pan'
    setInteractionMode('pan')
    viewerRef.current?.reset()
  }, [])
  const downloadView = useCallback(() => viewerRef.current?.download(), [])
  const selectInteractionMode = useCallback((mode) => {
    interactionModeRef.current = mode
    setInteractionMode(mode)
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

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
    const rotation = {
      x: THREE.MathUtils.degToRad(-3),
      y: 0,
      targetX: THREE.MathUtils.degToRad(-3),
      targetY: 0,
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 30)
    camera.position.set(0, 0.12, BASE_DISTANCE)

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
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: 0xb8ad94,
    })
    group.add(new THREE.Mesh(bodyGeometry, edgeMaterial))

    const faceGeometry = new THREE.ShapeGeometry(shape, 10)
    normalizeFaceUvs(faceGeometry, width, height)
    const textureLoader = new THREE.TextureLoader()

    const makeTextures = async (url, layoutName) => {
      const source = await textureLoader.loadAsync(url)
      const frontTexture = source.clone()
      const backTexture = source.clone()
      source.dispose()

      const layout = TEXTURE_LAYOUTS[layoutName] ?? TEXTURE_LAYOUTS.standard
      frontTexture.repeat.set(...layout.front.repeat)
      frontTexture.offset.set(...layout.front.offset)
      backTexture.repeat.set(...layout.back.repeat)
      backTexture.offset.set(...layout.back.offset)

      const prepared = [frontTexture, backTexture]
      prepared.forEach((texture) => {
        texture.needsUpdate = true
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      })
      return prepared
    }

    const textures = []
    makeTextures(card.images.source, card.images.layout)
      .then(([frontTexture, backTexture]) => {
        if (disposed) {
          frontTexture.dispose()
          backTexture.dispose()
          return
        }
        textures.push(frontTexture, backTexture)
        const frontMaterial = new THREE.MeshBasicMaterial({
          map: frontTexture,
          side: THREE.FrontSide,
        })
        const backMaterial = new THREE.MeshBasicMaterial({
          map: backTexture,
          side: THREE.FrontSide,
        })
        const front = new THREE.Mesh(faceGeometry, frontMaterial)
        front.position.z = depth / 2 + 0.005
        group.add(front)

        const back = new THREE.Mesh(faceGeometry, backMaterial)
        back.position.z = -depth / 2 - 0.005
        back.rotation.y = Math.PI
        group.add(back)
        setLoadState('ready')
      })
      .catch(() => {
        if (!disposed) setLoadState('error')
      })

    const resize = () => {
      const { width: nextWidth, height: nextHeight } = mount.getBoundingClientRect()
      if (!nextWidth || !nextHeight) return
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(nextWidth, nextHeight)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    const updateReadout = () => {
      const nextAngle = Math.round(normalize(THREE.MathUtils.radToDeg(rotation.y)))
      const nextZoom = BASE_DISTANCE / cameraDistance
      const nextFacingBack = Math.cos(rotation.x) * Math.cos(rotation.y) < 0
      if (nextAngle !== lastAngle) {
        lastAngle = nextAngle
        setAngle(nextAngle)
      }
      if (Math.abs(nextZoom - lastZoom) > 0.01) {
        lastZoom = nextZoom
        setZoom(nextZoom)
      }
      if (nextFacingBack !== lastFacingBack) {
        lastFacingBack = nextFacingBack
        setFacingBack(nextFacingBack)
      }
    }

    const animate = () => {
      frame = requestAnimationFrame(animate)
      if (!drag.active && !pinch.active) {
        rotation.targetX += drag.velocityX
        rotation.targetY += drag.velocityY
        drag.velocityX *= 0.86
        drag.velocityY *= 0.86
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
    }
    animate()

    const moveToAngle = (degrees) => {
      const currentDegrees = normalize(THREE.MathUtils.radToDeg(rotation.y))
      let delta = degrees - currentDegrees
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      rotation.targetY = rotation.y + THREE.MathUtils.degToRad(delta)
      rotation.targetX = 0
      drag.velocityX = 0
      drag.velocityY = 0
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
    }

    const panByPixels = (dx, dy) => {
      const viewportHeight = mount.clientHeight || 590
      const worldPerPixel = (2 * targetDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / viewportHeight
      const zoomScale = BASE_DISTANCE / targetDistance
      const maxPanX = Math.max(0, (zoomScale - 1) * 1.3)
      const maxPanY = Math.max(0, (zoomScale - 1) * 1.9)
      pan.targetX = THREE.MathUtils.clamp(pan.targetX + dx * worldPerPixel, -maxPanX, maxPanX)
      pan.targetY = THREE.MathUtils.clamp(pan.targetY - dy * worldPerPixel, -maxPanY, maxPanY)
    }

    viewerRef.current = {
      goTo: moveToAngle,
      changeZoom: (direction) => {
        setDistance(direction > 0 ? targetDistance / ZOOM_FACTOR : targetDistance * ZOOM_FACTOR)
      },
      reset: () => {
        setDistance(BASE_DISTANCE)
      },
      download: () => {
        renderer.render(scene, camera)
        const fileName = `水浒卡-${card.name}${card.edition ? `-${card.edition}` : ''}-${String(lastAngle).padStart(3, '0')}度.png`
        renderer.domElement.toBlob((blob) => {
          if (!blob || disposed) return
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        }, 'image/png')
      },
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
      setDragging(true)
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
        setDragging(false)
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
        setDragging(false)
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

    return () => {
      disposed = true
      viewerRef.current = null
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerEnd)
      renderer.domElement.removeEventListener('pointercancel', onPointerEnd)
      renderer.domElement.removeEventListener('wheel', onWheel)
      renderer.domElement.removeEventListener('dblclick', onDoubleClick)
      scene.traverse((object) => {
        if (!object.isMesh) return
        object.geometry?.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material?.dispose())
      })
      textures.forEach((texture) => texture.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [card.edition, card.images.layout, card.images.source, card.name])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft') goTo(angle - 30)
      else if (event.key === 'ArrowRight') goTo(angle + 30)
      else if (event.key === ' ') {
        event.preventDefault()
        goTo(angle > 90 && angle < 270 ? 0 : 180)
      } else if (event.key === '+' || event.key === '=') changeZoom(1)
      else if (event.key === '-' || event.key === '_') changeZoom(-1)
      else if (event.key === 'Escape') resetView()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [angle, changeZoom, goTo, resetView])

  const isBack = facingBack
  const isFocusMode = zoom > 1.08

  return (
    <div
      className={`stage-wrap grid place-items-center transition-colors duration-300 ${
        isFocusMode
          ? 'fixed inset-0 z-40 bg-[#050705f2] backdrop-blur-sm'
          : 'absolute inset-[70px_5%_80px_30%] max-lg:inset-[70px_2%_80px_28%] max-sm:inset-[150px_0_80px] mobile-device:inset-[150px_0_80px]'
      }`}
    >
      {isFocusMode && (
        <>
          <div className="absolute left-6 top-6 z-30 flex rounded-full border border-[#e6dfcb33] bg-[#111511cc] p-1" role="group" aria-label="放大后的拖动模式">
            <ModeButton label="移动" active={interactionMode === 'pan'} onClick={() => selectInteractionMode('pan')} />
            <ModeButton label="翻转" active={interactionMode === 'rotate'} onClick={() => selectInteractionMode('rotate')} />
          </div>
          <button
            type="button"
            className="absolute right-6 top-6 z-30 flex items-center gap-2 rounded-full border border-[#e6dfcb33] bg-[#111511cc] px-4 py-2 text-[11px] tracking-[.18em] text-[#a9ada5] transition-colors hover:border-[#c7a762] hover:text-[#e6dfcb]"
            onClick={resetView}
            aria-label="退出放大模式"
          >
            <span className="font-sans text-base">×</span> 退出放大
          </button>
        </>
      )}

      <div
        className={`stage relative ${isFocusMode ? 'h-[calc(100vh-144px)] w-screen' : 'h-[590px] w-[420px] max-sm:h-[500px] max-sm:w-full mobile-device:h-[500px] mobile-device:w-full'} ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        aria-label={`${card.name}水浒卡 three.js 360度预览区，拖动旋转，滚轮或双指缩放`}
      >
        <div ref={mountRef} className="three-card-canvas absolute inset-0 touch-none" />
        {loadState === 'loading' && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center" role="status" aria-live="polite">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#c7a76233] bg-[#080b09e6] px-7 py-6 shadow-[0_16px_45px_#000b] backdrop-blur-sm">
              <span className="relative block h-12 w-12 rounded-full border-2 border-[#c7a76226] border-r-[#e1ca8a] border-t-[#c7a762] shadow-[0_0_18px_#c7a76245] motion-safe:animate-spin" aria-hidden="true">
                <i className="absolute inset-[11px] rounded-full bg-[#c7a762] shadow-[0_0_10px_#c7a762]" />
              </span>
              <span className="animate-pulse text-[11px] tracking-[.28em] text-[#e5d7ae]">卡片载入中…</span>
            </div>
          </div>
        )}
        {loadState === 'error' && <span className="absolute inset-0 grid place-items-center text-xs text-[#bc6757]">卡片图片加载失败</span>}
      </div>

      <div className={`absolute w-[90px] text-right font-mono text-[9px] text-[#777f76] max-sm:hidden mobile-device:hidden ${isFocusMode ? 'bottom-8 right-8' : 'bottom-12 right-0'}`} aria-hidden="true">
        <span className="text-base text-[#c5bfae]">{angle}°</span>
        <div className="relative my-2.5 h-px bg-[#3d443e]">
          <i className="absolute top-[-2px] h-[5px] w-[5px] rounded-full bg-[#c7a762]" style={{ left: `${(angle / 360) * 100}%` }} />
        </div>
        <small className="tracking-[.15em]">360° THREE.JS</small>
      </div>

      <div className={`legacy-center-x absolute left-1/2 z-20 flex w-max max-w-[calc(100vw-16px)] items-center justify-center gap-5 whitespace-nowrap max-sm:gap-1.5 mobile-device:gap-1.5 ${isFocusMode ? 'bottom-6' : 'bottom-[-52px] max-sm:bottom-[-45px] mobile-device:bottom-[-45px]'}`}>
        <SideButton label="正面" mark="正" active={!isBack} onClick={() => goTo(0)} />
        <div className="flex shrink-0 items-center gap-3 text-[#a8aa9f]">
          <i className="font-sans text-[22px] not-italic text-[#c7a762]">↔</i>
          <span className="text-[11px] leading-tight tracking-[.12em] max-sm:hidden mobile-device:hidden">{isFocusMode ? `拖动${interactionMode === 'pan' ? '移动' : '翻转'}` : '拖动翻转'}<br /><small className="font-mono text-[8px] tracking-[.08em] text-[#596059]">{isFocusMode ? '顶部按钮切换模式' : '滚轮 / 双指放大'}</small></span>
        </div>
        <SideButton label="背面" mark="背" active={isBack} onClick={() => goTo(180)} />
        <span className="h-6 w-px shrink-0 bg-[#414740]" aria-hidden="true" />
        <ZoomButton label="缩小卡片" mark="−" onClick={() => changeZoom(-1)} disabled={zoom <= BASE_DISTANCE / MAX_DISTANCE + 0.02} />
        <span className="min-w-9 shrink-0 text-center font-mono text-[9px] text-[#8d938b]" aria-live="polite">{Math.round(zoom * 100)}%</span>
        <ZoomButton label="放大卡片" mark="＋" onClick={() => changeZoom(1)} disabled={zoom >= BASE_DISTANCE / MIN_DISTANCE - 0.05} />
        {!isUcBrowser && (
          <>
            <span className="h-6 w-px shrink-0 bg-[#414740]" aria-hidden="true" />
            <ActionButton label="下载当前样子的卡片" mark="↓" onClick={downloadView} />
          </>
        )}
      </div>
    </div>
  )
}

function ZoomButton({ label, mark, onClick, disabled }) {
  return (
    <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#555c55] bg-transparent font-sans text-lg text-[#c7a762] transition-colors hover:border-[#c7a762] hover:bg-[#c7a76214] disabled:cursor-not-allowed disabled:opacity-30" aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      {mark}
    </button>
  )
}

function ActionButton({ label, mark, onClick }) {
  return (
    <button type="button" className="flex h-8 shrink-0 items-center gap-2 rounded-full border border-[#555c55] bg-transparent px-3 font-serif text-[10px] tracking-[.12em] text-[#c7a762] transition-colors hover:border-[#c7a762] hover:bg-[#c7a76214]" aria-label={label} title={label} onClick={onClick}>
      <span className="font-sans text-base leading-none">{mark}</span>
      <span className="max-sm:hidden mobile-device:hidden">下载</span>
    </button>
  )
}

function ModeButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[11px] tracking-[.16em] transition-colors ${active ? 'bg-[#c7a762] text-[#11150f]' : 'text-[#92988f] hover:text-[#e6dfcb]'}`}
    >
      {label}
    </button>
  )
}

function SideButton({ label, mark, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-0 bg-transparent font-serif text-xs tracking-[.2em] max-sm:gap-1 max-sm:tracking-[.1em] mobile-device:gap-1 mobile-device:tracking-[.1em] ${active ? 'text-[#e4dcc5]' : 'text-[#6e756d]'}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-full border text-[11px] ${active ? 'border-[#c7a762] text-[#c7a762]' : 'border-[#414740]'}`}>{mark}</span>
      {label}
    </button>
  )
}
