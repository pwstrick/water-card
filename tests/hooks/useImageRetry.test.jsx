import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import useImageRetry from '../../src/hooks/useImageRetry'

afterEach(() => vi.useRealTimers())

describe('useImageRetry', () => {
  it('按 1 秒和 2 秒退避自动重试，最多执行两次', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useImageRetry('error', '/card.webp'))

    expect(result.current.isAutoRetrying).toBe(true)
    act(() => vi.advanceTimersByTime(999))
    expect(result.current.attempt).toBe(0)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.attempt).toBe(1)
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.attempt).toBe(2)
    expect(result.current.isAutoRetrying).toBe(false)
  })

  it('手动重试会立即递增 attempt 并停止自动调度', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useImageRetry('error', '/card.webp'))

    act(() => result.current.retry())
    expect(result.current.attempt).toBe(1)
    expect(result.current.isAutoRetrying).toBe(false)
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.attempt).toBe(1)
  })

  it('图片地址变化后重置重试状态', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ source }) => useImageRetry('error', source),
      { initialProps: { source: '/first.webp' } },
    )
    act(() => result.current.retry())
    rerender({ source: '/second.webp' })

    expect(result.current.attempt).toBe(0)
    expect(result.current.isAutoRetrying).toBe(true)
  })

  it('卸载时清理待执行的自动重试 timer', () => {
    vi.useFakeTimers()
    const clearSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = renderHook(() => useImageRetry('error', '/card.webp'))
    unmount()
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })
})
