import * as THREE from 'three'
import { getCardImageLayout } from '../../config/cardImageLayouts'
import { isMobileDevice } from '../../utils/device'
import {
  createCardFaceGeometry,
  createRoundedCardShape,
  loadCardTexture,
} from './cardSceneAssets'
import { bindCardInteraction } from './cardInteraction'
import { CARD_ZOOM_LIMITS, createCardMotion } from './cardMotion'
import { exportCardImage } from './exportCardImage'
export { CARD_ZOOM_LIMITS }

const CARD_WIDTH = 2
const CARD_HEIGHT = 2.9
const CARD_DEPTH = 0.018
const CARD_RADIUS = 0.095

export function createThreeCardScene({
  mount,
  interactionModeRef,
  onAngleChange,
  onZoomChange,
  onFacingBackChange,
  onDraggingChange,
  onLoadStateChange,
}) {
  let disposed = false
  let frame = 0
  let loadVersion = 0
  let currentCard = null
  let activeResourceKey = ''
  let cardResources = null

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 30)
  const mobileDevice = isMobileDevice()
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobileDevice ? 1.5 : 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  mount.appendChild(renderer.domElement)

  const group = new THREE.Group()
  scene.add(group)

  // 卡片厚度和边缘不会随人物变化，整个 viewer 生命周期只创建一次。
  const shape = createRoundedCardShape(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS)
  const bodyGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: CARD_DEPTH,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.008,
    bevelThickness: 0.004,
    curveSegments: 10,
  })
  bodyGeometry.translate(0, 0, -CARD_DEPTH / 2)
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xb8ad94 })
  group.add(new THREE.Mesh(bodyGeometry, edgeMaterial))

  let motion
  const animate = () => {
    frame = 0
    if (disposed) return
    motion.update()
    renderer.render(scene, camera)
    if (motion.hasMotion()) frame = requestAnimationFrame(animate)
  }

  const requestRender = () => {
    if (disposed || frame) return
    frame = requestAnimationFrame(animate)
  }

  motion = createCardMotion({
    camera,
    group,
    mount,
    onAngleChange,
    onFacingBackChange,
    onZoomChange,
    requestRender,
  })

  const resize = () => {
    const { width, height } = mount.getBoundingClientRect()
    if (!width || !height) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    requestRender()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(mount)
  resize()

  const disposeInteraction = bindCardInteraction({
    element: renderer.domElement,
    interactionModeRef,
    motion,
    onDraggingChange,
  })

  const disposeCardResources = (resources) => {
    if (!resources) return
    resources.objects.forEach((object) => group.remove(object))
    resources.geometries.forEach((geometry) => geometry.dispose())
    resources.materials.forEach((material) => material.dispose())
    resources.texture.dispose()
  }

  const updateCard = async (card) => {
    currentCard = card
    const resourceKey = [card.images.source, card.images.layout].join('|')
    if (resourceKey === activeResourceKey) return

    activeResourceKey = resourceKey
    const version = ++loadVersion
    onLoadStateChange('loading')

    try {
      const textureLoader = new THREE.TextureLoader()
      const texture = await loadCardTexture(textureLoader, renderer, card.images.source, {
        maxAnisotropy: mobileDevice ? 4 : undefined,
      })
      if (disposed || version !== loadVersion) {
        texture.dispose()
        return
      }

      const imageLayout = getCardImageLayout(card.images.layout)
      const frontGeometry = createCardFaceGeometry(shape, CARD_WIDTH, CARD_HEIGHT, imageLayout.front)
      const backGeometry = createCardFaceGeometry(shape, CARD_WIDTH, CARD_HEIGHT, imageLayout.back)
      const frontMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide })
      const backMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide })
      const front = new THREE.Mesh(frontGeometry, frontMaterial)
      const back = new THREE.Mesh(backGeometry, backMaterial)
      front.position.z = CARD_DEPTH / 2 + 0.005
      back.position.z = -CARD_DEPTH / 2 - 0.005
      back.rotation.y = Math.PI

      const nextResources = {
        texture,
        geometries: [frontGeometry, backGeometry],
        materials: [frontMaterial, backMaterial],
        objects: [front, back],
      }

      disposeCardResources(cardResources)
      cardResources = nextResources
      nextResources.objects.forEach((object) => group.add(object))
      onLoadStateChange('ready')
      requestRender()
    } catch {
      if (!disposed && version === loadVersion) onLoadStateChange('error')
    }
  }

  return {
    updateCard,
    goTo: motion.moveToAngle,
    changeZoom: motion.changeZoom,
    reset: motion.reset,
    download: () => {
      if (!currentCard) return
      exportCardImage({
        renderer,
        scene,
        camera,
        card: currentCard,
        angle: motion.getAngle(),
        isDisposed: () => disposed,
      })
    },
    dispose: () => {
      disposed = true
      loadVersion += 1
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      disposeInteraction()
      disposeCardResources(cardResources)
      bodyGeometry.dispose()
      edgeMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
