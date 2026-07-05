export default function ImageLoadError({ message = '图片加载失败', onRetry, className = '' }) {
  return (
    <div className={`absolute inset-0 z-10 grid place-items-center bg-[#0b0f0c] ${className}`} role="alert">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-xs tracking-[.12em] text-[#bc6757]">{message}</span>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onRetry()
          }}
          className="rounded-full border border-[#bc675780] bg-[#bc67570d] px-4 py-2 text-[10px] tracking-[.14em] text-[#d58a79] transition-colors hover:border-[#d58a79] hover:bg-[#bc67571f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bc675766]"
        >
          <span className="mr-1.5 font-sans" aria-hidden="true">↻</span>
          重新加载
        </button>
      </div>
    </div>
  )
}
