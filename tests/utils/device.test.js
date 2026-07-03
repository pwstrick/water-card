import { afterEach, describe, expect, it, vi } from 'vitest'
import { isMobileDevice } from '../../src/utils/device'

function mockDevice({ userAgent, touchPoints = 0, width, height, coarsePointer = false, innerWidth = width }) {
  vi.stubGlobal('navigator', { userAgent, maxTouchPoints: touchPoints })
  const windowObject = {
    innerWidth,
    innerHeight: height,
    screen: { width, height },
    matchMedia: () => ({ matches: coarsePointer }),
  }
  if (touchPoints > 0) windowObject.ontouchstart = null
  vi.stubGlobal('window', windowObject)
}

describe('isMobileDevice', () => {
  afterEach(() => vi.unstubAllGlobals())

  it.each([
    ['普通桌面设备', { userAgent: 'Mozilla/5.0 Macintosh', width: 1440, height: 900 }, false],
    ['窄窗口桌面设备', { userAgent: 'Mozilla/5.0 Macintosh', width: 1440, height: 900, innerWidth: 600 }, false],
    ['触屏笔记本', { userAgent: 'Mozilla/5.0 Windows NT 10.0', touchPoints: 10, width: 1920, height: 1080 }, false],
    ['Android 手机', { userAgent: 'Mozilla/5.0 Android Mobile', touchPoints: 5, width: 412, height: 915, coarsePointer: true }, true],
    ['桌面 UA 平板', { userAgent: 'Mozilla/5.0 Macintosh', touchPoints: 5, width: 1024, height: 1366, coarsePointer: true }, true],
    ['UC 电脑版模式', { userAgent: 'Mozilla/5.0 UCBrowser', touchPoints: 5, width: 900, height: 1440 }, true],
  ])('%s 判断为 %s', (_, device, expected) => {
    mockDevice(device)
    expect(isMobileDevice()).toBe(expected)
  })
})
