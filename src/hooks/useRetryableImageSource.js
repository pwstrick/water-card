import useImageRetry from './useImageRetry'
import { getRetryImageSource } from '../utils/imageSource'

// 将重试状态与 cache-busting URL 组合，调用方只需消费最终图片地址。
export default function useRetryableImageSource(loadState, source) {
  const { attempt, retry, isAutoRetrying } = useImageRetry(loadState, source)

  return {
    imageSource: getRetryImageSource(source, attempt),
    retry,
    isAutoRetrying,
  }
}
