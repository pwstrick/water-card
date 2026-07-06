import { describe, expect, it } from 'vitest'
import { createCards, heroes } from '../../src/data/heroes'

describe('createCards', () => {
  it('使用人物编号生成图片路径，不依赖数组下标', () => {
    const cards = createCards('example', 'webp')

    expect(cards).toHaveLength(heroes.length)
    cards.forEach((card) => {
      expect(card.images.source).toBe(`/assets/example/${card.number}.webp`)
    })
  })
})
