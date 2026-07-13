import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ComparisonCard from '../../../src/components/comparison/ComparisonCard'

const card = {
  id: '001',
  name: '宋江',
  images: {
    source: '/assets/standard/1.webp',
    layout: 'standard',
  },
}

afterEach(() => vi.useRealTimers())

function renderWithControlledImage(props) {
  const OriginalImage = globalThis.Image
  let image
  globalThis.Image = class {
    constructor() { image = this }
  }
  const result = render(<ComparisonCard card={card} comparisonKey="standard:001" {...props} />)
  globalThis.Image = OriginalImage
  return { ...result, image }
}

describe('ComparisonCard', () => {
  it('当前统一为反面时，新卡首次只渲染反面', () => {
    render(
      <ComparisonCard
        card={card}
        comparisonKey="standard:001"
        face="back"
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('宋江背面')).toBeInTheDocument()
    expect(screen.queryByLabelText('宋江正面')).not.toBeInTheDocument()
  })

  it('当前统一为正面时，新卡首次只渲染正面', () => {
    render(
      <ComparisonCard
        card={card}
        comparisonKey="standard:001"
        face="front"
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('宋江正面')).toBeInTheDocument()
    expect(screen.queryByLabelText('宋江背面')).not.toBeInTheDocument()
  })

  it('图片就绪两个动画帧后切换为标准 3D 双面结构', () => {
    vi.useFakeTimers()
    const { image } = renderWithControlledImage({ face: 'back', onRemove: vi.fn() })

    act(() => image.onload())
    expect(screen.getAllByLabelText('宋江背面')).toHaveLength(1)
    expect(screen.queryByLabelText('宋江正面')).not.toBeInTheDocument()

    act(() => vi.runAllTimers())
    expect(screen.getByLabelText('宋江正面')).toBeInTheDocument()
    expect(screen.getByLabelText('宋江背面')).toBeInTheDocument()
    expect(screen.getByLabelText('宋江背面').parentElement).toHaveClass('is-face-transition-ready')
  })

  it('删除动画结束后触发移除', () => {
    vi.useFakeTimers()
    const onRemove = vi.fn()
    render(<ComparisonCard card={card} comparisonKey="standard:001" face="front" onRemove={onRemove} />)

    fireEvent.click(screen.getByRole('listitem'))
    fireEvent.click(screen.getByRole('button', { name: '将宋江移出对比区' }))
    act(() => vi.advanceTimersByTime(219))
    expect(onRemove).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onRemove).toHaveBeenCalledWith('standard:001')
  })

  it('删除动画期间卸载会清理 timer', () => {
    vi.useFakeTimers()
    const onRemove = vi.fn()
    const { unmount } = render(
      <ComparisonCard card={card} comparisonKey="standard:001" face="front" onRemove={onRemove} />,
    )
    fireEvent.click(screen.getByRole('listitem'))
    fireEvent.click(screen.getByRole('button', { name: '将宋江移出对比区' }))
    unmount()
    act(() => vi.runAllTimers())
    expect(onRemove).not.toHaveBeenCalled()
  })
})
