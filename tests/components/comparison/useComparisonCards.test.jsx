import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useComparisonCards from '../../../src/components/comparison/useComparisonCards'
import { MAX_COMPARISON_CARDS } from '../../../src/data/collections'

const createCard = (id) => ({ id, name: `人物${id}` })
const collections = [
  { id: 'standard', cards: ['034', '001', '002', '003', '004', '005'].map(createCard) },
  { id: 'flash_prize', cards: ['034', '001'].map(createCard) },
]

describe('useComparisonCards', () => {
  it('默认选择普卡和奖闪的解珍', () => {
    const { result } = renderHook(() => useComparisonCards(collections))
    expect(result.current.selectedCards.map(({ key }) => key)).toEqual([
      'standard:034',
      'flash_prize:034',
    ])
  })

  it('在状态层限制最多选择 6 张卡', () => {
    const { result } = renderHook(() => useComparisonCards(collections))

    for (const card of collections[0].cards.slice(1, 5)) {
      act(() => result.current.togglePickerCard(card))
    }
    expect(result.current.selectedCards).toHaveLength(MAX_COMPARISON_CARDS)

    act(() => result.current.togglePickerCard(collections[0].cards[5]))
    expect(result.current.selectedCards).toHaveLength(MAX_COMPARISON_CARDS)
  })

  it('拖动后按目标位置更新顺序', () => {
    const { result } = renderHook(() => useComparisonCards(collections))

    act(() => result.current.reorderCards('flash_prize:034', 'standard:034'))
    expect(result.current.selectedCards.map(({ key }) => key)).toEqual([
      'flash_prize:034',
      'standard:034',
    ])
  })
})
