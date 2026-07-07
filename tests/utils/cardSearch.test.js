import { describe, expect, it } from 'vitest'
import { getCardSearchText, getRomanizedInitials, normalizeSearchText } from '../../src/utils/cardSearch'

describe('cardSearch', () => {
  it('normalizes text for case-insensitive compact matching', () => {
    expect(normalizeSearchText(' Wu Song ')).toBe('wusong')
    expect(normalizeSearchText('李 俊2')).toBe('李俊2')
    expect(normalizeSearchText(null)).toBe('')
  })

  it('builds initials from romanized names', () => {
    expect(getRomanizedInitials('LU ZHISHEN')).toBe('lz')
    expect(getRomanizedInitials('HU SANNIANG')).toBe('hs')
    expect(getRomanizedInitials('')).toBe('')
  })

  it('includes ids, Chinese fields, edition, romanized name, and initials', () => {
    const searchText = getCardSearchText({
      id: '143',
      displayId: '赠01',
      name: '扈三娘',
      nickname: '一丈青',
      edition: '周信用',
      star: '地慧星',
      romanizedName: 'HU SANNIANG',
    })

    expect(searchText).toContain('143')
    expect(searchText).toContain('赠01')
    expect(searchText).toContain('扈三娘')
    expect(searchText).toContain('一丈青')
    expect(searchText).toContain('周信用')
    expect(searchText).toContain('husanniang')
    expect(searchText).toContain('hs')
  })
})
