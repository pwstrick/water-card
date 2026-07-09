import { describe, expect, it } from 'vitest'
import { heroCards } from '../../src/data/code_perm'

describe('code_perm cards', () => {
  it('冷烫基础好汉可按卡图实际顺序修正图片编号', () => {
    expect(heroCards.find((item) => item.name === '李忠')).toMatchObject({
      id: '086',
      displayId: '086',
      number: 86,
      images: {
        source: '/assets/code_perm/86.webp',
        layout: 'code_perm',
      },
    })
    expect(heroCards.slice(85, 93).map(({ displayId, name }) => `${displayId} ${name}`)).toEqual([
      '086 李忠',
      '087 周通',
      '088 汤隆',
      '089 杜兴',
      '090 邹渊',
      '091 邹润',
      '092 朱贵',
      '093 朱富',
    ])
    expect(heroCards.find((item) => item.name === '周通')?.images.source).toBe('/assets/code_perm/87.webp')
    expect(heroCards.find((item) => item.name === '杜兴')?.images.source).toBe('/assets/code_perm/89.webp')
    expect(heroCards.find((item) => item.name === '汤隆')?.images.source).toBe('/assets/code_perm/88.webp')
    expect(heroCards.find((item) => item.name === '邹润')?.images.source).toBe('/assets/code_perm/91.webp')
    expect(heroCards.find((item) => item.name === '邹渊')?.images.source).toBe('/assets/code_perm/90.webp')
    expect(heroCards.find((item) => item.name === '朱富')?.images.source).toBe('/assets/code_perm/93.webp')
    expect(heroCards.find((item) => item.name === '朱贵')?.images.source).toBe('/assets/code_perm/92.webp')
  })

  it('异画卡继承基础好汉信息并覆盖名称', () => {
    const card = heroCards.find((item) => item.id === '115')

    expect(card).toMatchObject({
      displayId: '异01',
      name: '雪夜林冲',
      nickname: '豹子头',
      romanizedName: 'LIN CHONG',
    })
  })

  it('赠卡继承扈三娘信息并写入 edition', () => {
    const card = heroCards.find((item) => item.id === '143')

    expect(card).toMatchObject({
      displayId: '赠01',
      name: '扈三娘',
      nickname: '一丈青',
      edition: '周信用',
    })
  })
})
