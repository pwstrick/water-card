import { describe, expect, it } from 'vitest'
import { heroCards } from '../../src/data/code_perm'

describe('code_perm cards', () => {
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
