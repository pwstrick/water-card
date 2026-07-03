import { describe, expect, it } from 'vitest'
import { getCardFaceBackgroundStyle, getCardImageLayout } from '../../src/config/cardImageLayouts'

describe('cardImageLayouts', () => {
  it('未知裁切配置回退到普卡配置', () => {
    expect(getCardImageLayout('missing')).toEqual(getCardImageLayout('standard'))
  })

  it('将奖闪正面裁切转换为 CSS 背景参数', () => {
    expect(getCardFaceBackgroundStyle('flash_prize', 'front')).toEqual({
      backgroundSize: '200% 100%',
      backgroundPosition: '0% 0%',
    })
  })

  it('正确换算普卡正面的偏移比例', () => {
    expect(getCardFaceBackgroundStyle('standard', 'front')).toEqual({
      backgroundSize: '217.4% 106.2%',
      backgroundPosition: '4.8% 50%',
    })
  })
})
