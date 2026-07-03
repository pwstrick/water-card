// 保留完整 Tailwind 类名，确保构建时能静态扫描并生成对应尺寸样式。
const spinnerSizes = {
  sm: 'h-10 w-10',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
}

export default function LoadingIndicator({
  label,
  size = 'lg',
  panel = false,
  glow = false,
  showCore = false,
  showLabel = true,
  pulseLabel = false,
  className = '',
  labelClassName = '',
}) {
  return (
    <div
      className={`flex flex-col items-center gap-4 text-[#e5d7ae] ${panel ? 'rounded-2xl border border-[#c7a76233] bg-[#080b09e6] px-7 py-6 shadow-[0_16px_45px_#000b]' : ''} ${className}`}
      role="status"
      aria-label={label}
    >
      <span
        className={`relative block rounded-full border-2 border-[#c7a76226] border-r-[#e1ca8a] border-t-[#c7a762] motion-safe:animate-spin ${spinnerSizes[size] ?? spinnerSizes.lg} ${glow ? 'shadow-[0_0_18px_#c7a76245]' : ''}`}
        aria-hidden="true"
      >
        {showCore && <i className="absolute inset-[11px] rounded-full bg-[#c7a762] shadow-[0_0_10px_#c7a762]" />}
      </span>
      {showLabel && (
        <span className={`${pulseLabel ? 'animate-pulse' : ''} ${labelClassName}`}>{label}</span>
      )}
    </div>
  )
}
