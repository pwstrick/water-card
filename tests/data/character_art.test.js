import { describe, expect, it } from 'vitest'
import { cards, extraCharacterCards, heroCards, villainCards } from '../../src/data/character_art'

describe('character_art cards', () => {
  it('立绘保留人物排名并映射李忠、周通的实际图片编号', () => {
    expect(heroCards.find((item) => item.name === '周通')).toMatchObject({
      id: '086',
      displayId: '086',
      images: { source: '/assets/character_art/87.webp' },
    })
    expect(heroCards.find((item) => item.name === '李忠')).toMatchObject({
      id: '087',
      displayId: '087',
      images: { source: '/assets/character_art/86.webp' },
    })
  })

  it('包含 108 将并使用立绘图资源', () => {
    expect(cards).toHaveLength(115)
    expect(heroCards).toHaveLength(108)
    expect(cards[0]).toMatchObject({
      id: '001',
      displayId: '001',
      name: '宋江',
      nickname: '呼保义',
      images: {
        source: '/assets/character_art/1.webp',
        layout: 'character_art',
      },
    })
    expect(cards[107]).toMatchObject({
      id: '108',
      displayId: '108',
      name: '段景住',
      images: {
        source: '/assets/character_art/108.webp',
        layout: 'character_art',
      },
    })
  })

  it('108 将之后追加 112.webp 开始的立绘恶人与特卡', () => {
    expect(cards.slice(108).map((card) => card.name)).toEqual([
      '西门庆',
      '潘金莲',
      '高衙内',
      '朱富',
      '琼英',
      '阎婆惜',
      '李师师',
    ])

    expect(villainCards).toHaveLength(3)
    expect(villainCards[0]).toMatchObject({
      id: '112',
      displayId: '恶01',
      name: '西门庆',
      identity: '阳谷县豪绅',
      series: '六大恶人',
      kind: 'villain',
      images: {
        source: '/assets/character_art/112.webp',
        layout: 'character_art',
      },
    })
    expect(villainCards[1]).toMatchObject({
      id: '113',
      displayId: '恶02',
      name: '潘金莲',
      kind: 'villain',
    })
    expect(villainCards[2]).toMatchObject({
      id: '114',
      displayId: '恶03',
      name: '高衙内',
      kind: 'villain',
    })

    expect(extraCharacterCards).toHaveLength(4)
    expect(extraCharacterCards.map((card) => card.displayId)).toEqual(['特01', '特02', '特03', '特04'])
    expect(extraCharacterCards[0]).toMatchObject({
      id: '115',
      name: '朱富',
      nickname: '笑面虎',
      edition: '错版',
      star: '特卡',
      images: {
        source: '/assets/character_art/115.webp',
        layout: 'character_art',
      },
    })
    expect(cards[108]).toMatchObject({
      id: '112',
      displayId: '恶01',
      kind: 'villain',
    })
  })
})
