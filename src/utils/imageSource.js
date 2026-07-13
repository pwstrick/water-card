export function getRetryImageSource(source, attempt) {
  if (!attempt) return source

  // 保留原查询参数和 hash，只追加 retry 以绕过浏览器中的失败响应缓存。
  const [url, hash] = source.split('#', 2)
  const separator = url.includes('?') ? '&' : '?'
  const retryUrl = `${url}${separator}retry=${attempt}`
  return hash ? `${retryUrl}#${hash}` : retryUrl
}
