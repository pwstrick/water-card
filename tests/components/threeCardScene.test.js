import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const pendingLoads = new Map()
  const makeDisposable = () => ({ dispose: vi.fn(), translate: vi.fn() })
  const renderer = {
    domElement: document.createElement('canvas'),
    capabilities: { getMaxAnisotropy: () => 16 },
    setPixelRatio: vi.fn(),
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  }
  class Group {
    constructor() { this.add = vi.fn(); this.remove = vi.fn() }
  }
  class Mesh {
    constructor(geometry, material) {
      this.geometry = geometry
      this.material = material
      this.position = { z: 0 }
      this.rotation = { y: 0 }
    }
  }
  return { pendingLoads, makeDisposable, renderer, Group, Mesh }
})

vi.mock('three', () => ({
  Scene: class { add = vi.fn() },
  PerspectiveCamera: class { aspect = 1; updateProjectionMatrix = vi.fn() },
  WebGLRenderer: class { constructor() { return mocks.renderer } },
  Group: mocks.Group,
  ExtrudeGeometry: class { dispose = vi.fn(); translate = vi.fn() },
  MeshBasicMaterial: class { dispose = vi.fn() },
  Mesh: mocks.Mesh,
  TextureLoader: class {},
  FrontSide: 1,
  SRGBColorSpace: 'srgb',
  NoToneMapping: 'none',
}))
vi.mock('../../src/utils/device', () => ({ isMobileDevice: () => false }))
vi.mock('../../src/components/card-viewer/cardSceneAssets', () => ({
  createRoundedCardShape: vi.fn(() => ({})),
  createCardFaceGeometry: vi.fn(() => mocks.makeDisposable()),
  loadCardTexture: vi.fn((_loader, _renderer, url) => new Promise((resolve, reject) => {
    mocks.pendingLoads.set(url, { resolve, reject })
  })),
}))
vi.mock('../../src/components/card-viewer/cardInteraction', () => ({
  bindCardInteraction: vi.fn(() => vi.fn()),
}))
vi.mock('../../src/components/card-viewer/cardMotion', () => ({
  CARD_ZOOM_LIMITS: { min: 0.7, max: 5.6 },
  createCardMotion: vi.fn(() => ({
    update: vi.fn(), hasMotion: () => false, moveToAngle: vi.fn(), changeZoom: vi.fn(),
    reset: vi.fn(), getAngle: () => 0,
  })),
}))
vi.mock('../../src/components/card-viewer/exportCardImage', () => ({ exportCardImage: vi.fn() }))

import { createThreeCardScene } from '../../src/components/card-viewer/threeCardScene'
import { loadCardTexture } from '../../src/components/card-viewer/cardSceneAssets'

const card = (id) => ({ id, name: id, images: { source: `/${id}.webp`, layout: 'standard' } })

function createScene() {
  const mount = document.createElement('div')
  mount.getBoundingClientRect = () => ({ width: 420, height: 590 })
  const onLoadStateChange = vi.fn()
  const scene = createThreeCardScene({
    mount,
    interactionModeRef: { current: 'pan' },
    onAngleChange: vi.fn(), onZoomChange: vi.fn(), onFacingBackChange: vi.fn(),
    onDraggingChange: vi.fn(), onLoadStateChange,
  })
  return { scene, onLoadStateChange }
}

beforeEach(() => {
  mocks.pendingLoads.clear()
  vi.clearAllMocks()
  globalThis.ResizeObserver = class { observe() {}; disconnect() {} }
})

describe('createThreeCardScene.updateCard', () => {
  it('忽略快速切换后迟到的旧纹理', async () => {
    const { scene, onLoadStateChange } = createScene()
    const first = scene.updateCard(card('first'))
    const second = scene.updateCard(card('second'))
    const secondTexture = { dispose: vi.fn() }
    const firstTexture = { dispose: vi.fn() }

    mocks.pendingLoads.get('/second.webp').resolve(secondTexture)
    await second
    mocks.pendingLoads.get('/first.webp').resolve(firstTexture)
    await first

    expect(onLoadStateChange).toHaveBeenLastCalledWith('ready')
    expect(firstTexture.dispose).toHaveBeenCalledTimes(1)
    expect(secondTexture.dispose).not.toHaveBeenCalled()
    scene.dispose()
  })

  it('相同资源不会重复加载，销毁时释放当前纹理', async () => {
    const { scene } = createScene()
    const selectedCard = card('same')
    const update = scene.updateCard(selectedCard)
    const texture = { dispose: vi.fn() }
    mocks.pendingLoads.get('/same.webp').resolve(texture)
    await update
    await scene.updateCard({ ...selectedCard })

    expect(loadCardTexture).toHaveBeenCalledTimes(1)
    scene.dispose()
    expect(texture.dispose).toHaveBeenCalledTimes(1)
    expect(mocks.renderer.dispose).toHaveBeenCalledTimes(1)
  })

  it('销毁后返回的纹理会立即释放', async () => {
    const { scene } = createScene()
    const update = scene.updateCard(card('late'))
    const texture = { dispose: vi.fn() }
    scene.dispose()
    mocks.pendingLoads.get('/late.webp').resolve(texture)
    await update
    expect(texture.dispose).toHaveBeenCalledTimes(1)
  })
})
