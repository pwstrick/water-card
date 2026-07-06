import { describe, expect, it } from 'vitest'
import { flipPixelRows } from '../../src/utils/imagePixels'

describe('flipPixelRows', () => {
  it('将 WebGL 自下而上的像素行翻转为 Canvas 顺序', () => {
    const bottomRow = [1, 2, 3, 4, 5, 6, 7, 8]
    const topRow = [9, 10, 11, 12, 13, 14, 15, 16]

    expect([...flipPixelRows(new Uint8Array([...bottomRow, ...topRow]), 2, 2)])
      .toEqual([...topRow, ...bottomRow])
  })
})
