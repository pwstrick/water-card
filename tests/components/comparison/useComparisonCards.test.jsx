import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useComparisonCards from '../../../src/components/comparison/useComparisonCards'
import { MAX_COMPARISON_CARDS } from '../../../src/data/collections'

const createCard = (id) => ({ id, name: `人物${id}` })
const createNamedCard = (id, name) => ({ id, name })
const collections = [
  { id: 'standard', cards: ['034', '001', '002', '003', '004', '005'].map(createCard) },
  { id: 'flash_prize', cards: ['034', '001'].map(createCard) },
  { id: 'code_perm', cards: ['034', '001'].map(createCard) },
  { id: 'character_art', cards: ['034', '001'].map(createCard) },
]

describe('useComparisonCards', () => {
  it('默认选择四个版本的解珍', () => {
    const { result } = renderHook(() => useComparisonCards(collections))
    expect(result.current.selectedCards.map(({ key }) => key)).toEqual([
      'standard:034',
      'flash_prize:034',
      'code_perm:034',
      'character_art:034',
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
      'code_perm:034',
      'character_art:034',
    ])
  })

  it('可以将卡片移出对比区', () => {
    const { result } = renderHook(() => useComparisonCards(collections))

    act(() => result.current.removeCard('standard:034'))

    expect(result.current.selectedCards.map(({ key }) => key)).toEqual([
      'flash_prize:034',
      'code_perm:034',
      'character_art:034',
    ])
  })

  it('可以清空对比区', () => {
    const { result } = renderHook(() => useComparisonCards(collections))

    act(() => result.current.clearCards())

    expect(result.current.selectedCards).toEqual([])
    expect(result.current.selectionFull).toBe(false)
  })

  it('可以基于第一张卡替换为各栏目同人物对比', () => {
    const comparisonCollections = [
      { id: 'standard', cards: [createNamedCard('034', '解珍'), createNamedCard('001', '宋江')] },
      { id: 'flash_prize', cards: [createNamedCard('034', '解珍'), createNamedCard('001', '宋江')] },
      { id: 'code_perm', cards: [createNamedCard('034', '解珍')] },
      { id: 'character_art', cards: [createNamedCard('034', '解珍'), createNamedCard('112', '西门庆')] },
    ]
    const { result } = renderHook(() => useComparisonCards(comparisonCollections))

    act(() => result.current.removeCard('standard:034'))
    act(() => result.current.changePickerCollection('character_art'))
    act(() => result.current.togglePickerCard(comparisonCollections[3].cards[1]))
    act(() => result.current.reorderCards('character_art:112', 'flash_prize:034'))
    act(() => result.current.compareSameCharacter())

    expect(result.current.selectedCards.map(({ key }) => key)).toEqual([
      'character_art:112',
    ])
  })

  it('同人物对比会保留第一张卡并追加其他栏目的同名卡', () => {
    const { result } = renderHook(() => useComparisonCards(collections))

    act(() => result.current.compareSameCharacter())

    expect(result.current.selectedCards.map(({ key }) => key)).toEqual([
      'standard:034',
      'flash_prize:034',
      'code_perm:034',
      'character_art:034',
    ])
  })

  it('可以切换到排名相邻人物的各卡组版本，并在首尾禁用对应方向', () => {
    const { result } = renderHook(() => useComparisonCards(collections))

    expect(result.current.canComparePrevious).toBe(false)
    expect(result.current.canCompareNext).toBe(true)

    act(() => result.current.compareNextCharacter())
    expect(result.current.selectedCards.map(({ key }) => key)).toEqual([
      'standard:001',
      'flash_prize:001',
      'code_perm:001',
      'character_art:001',
    ])
    expect(result.current.canComparePrevious).toBe(true)

    act(() => result.current.comparePreviousCharacter())
    expect(result.current.selectedCards.map(({ key }) => key)).toEqual([
      'standard:034',
      'flash_prize:034',
      'code_perm:034',
      'character_art:034',
    ])
  })
})
