import { Suspense, useEffect, useRef, useState } from 'react'

export default function DeferredSection({
  id,
  children,
  fallback,
  rootMargin = '0px',
  className = '',
}) {
  const triggerRef = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (shouldLoad) return undefined
    const trigger = triggerRef.current
    // 老浏览器不支持观察器时直接加载，优先保证内容可访问。
    if (!trigger || !('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setShouldLoad(true)
      observer.disconnect()
    }, { rootMargin, threshold: 0 })

    observer.observe(trigger)
    return () => observer.disconnect()
  }, [rootMargin, shouldLoad])

  // 调用方若使用负 rootMargin，需要传入足够的最小高度来提供可滚动空间。
  return (
    <div id={id} ref={triggerRef} className={className || 'min-h-px'}>
      {shouldLoad && <Suspense fallback={fallback}>{children}</Suspense>}
    </div>
  )
}
