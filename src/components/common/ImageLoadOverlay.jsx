import ImageLoadError from './ImageLoadError'
import LoadingIndicator from './LoadingIndicator'

export default function ImageLoadOverlay({
  loadState,
  isAutoRetrying,
  onRetry,
  loadingLabel,
  retryingLabel,
  errorMessage,
  overlayClassName = '',
  loadingIndicatorProps = {},
  retryingIndicatorProps = {},
  errorClassName = '',
}) {
  // 自动重试阶段不暴露手动按钮，重试次数耗尽后才交由用户决定。
  if (loadState === 'loading') {
    return (
      <div className={overlayClassName} aria-live="polite">
        <LoadingIndicator label={loadingLabel} {...loadingIndicatorProps} />
      </div>
    )
  }

  if (loadState === 'error' && isAutoRetrying) {
    return (
      <div className={overlayClassName}>
        <LoadingIndicator label={retryingLabel} {...retryingIndicatorProps} />
      </div>
    )
  }

  if (loadState === 'error') {
    return <ImageLoadError message={errorMessage} className={errorClassName} onRetry={onRetry} />
  }

  return null
}
