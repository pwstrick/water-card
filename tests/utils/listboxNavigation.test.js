import { describe, expect, it, vi } from 'vitest'
import { getListboxNavigationIndex } from '../../src/utils/listboxNavigation'

describe('listboxNavigation', () => {
  it('maps arrow keys to directional enabled-index lookup', () => {
    const findEnabledIndex = vi.fn((startIndex, direction) => startIndex + direction)

    expect(getListboxNavigationIndex({
      key: 'ArrowDown',
      startIndex: 2,
      itemCount: 5,
      findEnabledIndex,
    })).toBe(3)
    expect(findEnabledIndex).toHaveBeenLastCalledWith(2, 1, false)

    expect(getListboxNavigationIndex({
      key: 'ArrowUp',
      startIndex: 2,
      itemCount: 5,
      findEnabledIndex,
      includeStart: true,
    })).toBe(1)
    expect(findEnabledIndex).toHaveBeenLastCalledWith(2, -1, true)
  })

  it('maps Home and End to list boundaries', () => {
    const findEnabledIndex = vi.fn((startIndex) => startIndex)

    expect(getListboxNavigationIndex({
      key: 'Home',
      startIndex: 3,
      itemCount: 5,
      findEnabledIndex,
    })).toBe(0)
    expect(findEnabledIndex).toHaveBeenLastCalledWith(0, 1, true)

    expect(getListboxNavigationIndex({
      key: 'End',
      startIndex: 1,
      itemCount: 5,
      findEnabledIndex,
    })).toBe(4)
    expect(findEnabledIndex).toHaveBeenLastCalledWith(4, -1, true)
  })

  it('returns -1 for non-navigation keys or empty lists', () => {
    const findEnabledIndex = vi.fn()

    expect(getListboxNavigationIndex({
      key: 'Enter',
      startIndex: 0,
      itemCount: 3,
      findEnabledIndex,
    })).toBe(-1)
    expect(getListboxNavigationIndex({
      key: 'ArrowDown',
      startIndex: 0,
      itemCount: 0,
      findEnabledIndex,
    })).toBe(-1)
    expect(findEnabledIndex).not.toHaveBeenCalled()
  })
})
