// UC 的 UA 在不同内核和系统上名称不同，需要同时覆盖历史与当前标识。
const UC_BROWSER_PATTERN = /UCWEB|UCBrowser|UC Browser/i
// 这里只用于布局兜底；最终判断还会结合触摸能力、指针类型和设备尺寸。
const MOBILE_BROWSER_PATTERN = /Android|iPhone|iPad|iPod|Mobile|UCWEB|UCBrowser/i
const PHONE_SHORT_SIDE_LIMIT = 768
const TABLET_SHORT_SIDE_LIMIT = 1024

export function isUcBrowser(userAgent = globalThis.navigator?.userAgent ?? '') {
  return UC_BROWSER_PATTERN.test(userAgent)
}

export function isMobileDevice() {
  const navigatorObject = globalThis.navigator
  const windowObject = globalThis.window
  if (!navigatorObject || !windowObject) return false

  const userAgent = navigatorObject.userAgent
  const mobileUserAgent = MOBILE_BROWSER_PATTERN.test(userAgent)
  const touchCapableDevice = navigatorObject.maxTouchPoints > 0 || 'ontouchstart' in windowObject
  const coarsePrimaryPointer = windowObject.matchMedia?.('(pointer: coarse)').matches ?? false
  const screenWidth = windowObject.screen?.width || windowObject.innerWidth
  const screenHeight = windowObject.screen?.height || windowObject.innerHeight
  const shortScreenSide = Math.min(screenWidth, screenHeight)
  const phoneSizedScreen = shortScreenSide <= PHONE_SHORT_SIDE_LIMIT

  // 触摸能力本身不能代表移动设备：触屏笔记本通常仍有精细指针且屏幕更大。
  const touchFirstTablet = touchCapableDevice
    && coarsePrimaryPointer
    && shortScreenSide <= TABLET_SHORT_SIDE_LIMIT

  // UC 的“电脑版网页”模式可能改写移动 UA；此时用触摸能力与设备短边补回移动布局。
  const ucDesktopModeFallback = isUcBrowser(userAgent)
    && touchCapableDevice
    && shortScreenSide <= TABLET_SHORT_SIDE_LIMIT

  return mobileUserAgent
    || phoneSizedScreen
    || touchFirstTablet
    || ucDesktopModeFallback
}
