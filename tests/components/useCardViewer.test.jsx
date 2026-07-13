import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const sceneMocks = vi.hoisted(() => {
  const viewer = {
    updateCard: vi.fn(),
    goTo: vi.fn(),
    changeZoom: vi.fn(),
    reset: vi.fn(),
    download: vi.fn(),
    dispose: vi.fn(),
  }
  return { viewer, createThreeCardScene: vi.fn(() => viewer) }
})

vi.mock('../../src/components/card-viewer/threeCardScene', () => ({
  CARD_ZOOM_LIMITS: { min: 0.7, max: 5.6 },
  createThreeCardScene: sceneMocks.createThreeCardScene,
}))
vi.mock('../../src/hooks/useRetryableImageSource', () => ({
  default: (_loadState, source) => ({ imageSource: source, retry: vi.fn(), isAutoRetrying: false }),
}))

import useCardViewer from '../../src/components/card-viewer/useCardViewer'

const firstCard = { id: '001', name: '宋江', images: { source: '/1.webp', layout: 'standard' } }
const secondCard = { id: '002', name: '卢俊义', images: { source: '/2.webp', layout: 'standard' } }

function Harness({ card }) {
  const viewer = useCardViewer(card)
  return <div ref={viewer.mountRef} />
}

describe('useCardViewer', () => {
  it('换卡时复用场景并只调用 updateCard', () => {
    const { rerender, unmount } = render(<Harness card={firstCard} />)
    expect(sceneMocks.createThreeCardScene).toHaveBeenCalledTimes(1)
    expect(sceneMocks.viewer.updateCard).toHaveBeenLastCalledWith(firstCard)

    rerender(<Harness card={secondCard} />)
    expect(sceneMocks.createThreeCardScene).toHaveBeenCalledTimes(1)
    expect(sceneMocks.viewer.updateCard).toHaveBeenLastCalledWith(secondCard)
    expect(sceneMocks.viewer.dispose).not.toHaveBeenCalled()

    unmount()
    expect(sceneMocks.viewer.dispose).toHaveBeenCalledTimes(1)
  })
})
