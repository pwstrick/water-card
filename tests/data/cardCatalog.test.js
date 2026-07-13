import { describe, expect, it } from 'vitest'
import {
  findCardSelection,
  findCharacterCards,
  getCardById,
  getCollectionById,
  resolveCardSelection,
} from '../../src/data/cardCatalog'

const collections = [
  {
    id: 'standard',
    cards: [
      { id: '001', name: '宋江' },
      { id: '034', name: '解珍' },
    ],
  },
  {
    id: 'flash_prize',
    cards: [{ id: '034', name: '解珍' }],
  },
]

describe('cardCatalog', () => {
  it('按标识精确查找卡组和卡片', () => {
    expect(getCollectionById(collections, 'flash_prize')).toBe(collections[1])
    expect(getCardById(collections[0], '034')).toBe(collections[0].cards[1])
    expect(findCardSelection(collections, 'flash_prize', '034')).toEqual({
      collection: collections[1],
      card: collections[1].cards[0],
    })
  })

  it('页面选择无效时统一回退到首个可用项', () => {
    expect(resolveCardSelection(collections, 'missing', 'missing')).toEqual({
      collection: collections[0],
      card: collections[0].cards[0],
    })
    expect(resolveCardSelection(collections, 'standard', 'missing')).toEqual({
      collection: collections[0],
      card: collections[0].cards[0],
    })
  })

  it('精确查询不回退失效标识', () => {
    expect(findCardSelection(collections, 'standard', 'missing')).toEqual({
      collection: collections[0],
      card: undefined,
    })
    expect(findCardSelection(collections, 'missing', '034')).toEqual({
      collection: undefined,
      card: undefined,
    })
  })

  it('按人物名查找各卡组版本并保持卡组顺序', () => {
    expect(findCharacterCards(collections, '解珍')).toEqual([
      { collection: collections[0], card: collections[0].cards[1] },
      { collection: collections[1], card: collections[1].cards[0] },
    ])
  })
})
