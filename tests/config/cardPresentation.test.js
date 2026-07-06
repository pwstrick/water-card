import { describe, expect, it } from 'vitest'
import { getCardBadgeClass } from '../../src/config/cardPresentation'

describe('getCardBadgeClass', () => {
  it('优先使用人物类型对应的色调', () => {
    const collection = {
      presentation: { badgeTone: 'neutral', kindBadgeTones: { villain: 'danger' } },
    }

    expect(getCardBadgeClass(collection, { kind: 'villain' })).toContain('text-[#d77a68]')
  })

  it('未知色调安全回退到中性色', () => {
    expect(getCardBadgeClass({ presentation: { badgeTone: 'missing' } }, {}))
      .toBe('border-[#73797066] text-[#858b83]')
  })
})
