// pill 用于主鉴赏区，boxed 用于对比区；组件行为一致，仅视觉语义不同。
const styles = {
  pill: {
    root: 'relative z-20 inline-flex max-w-full overflow-x-auto rounded-full border border-[#e6dfcb1f] bg-[#080b0980] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    button: 'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[11px] tracking-[.18em] transition-all max-sm:px-2 max-sm:text-[10px] mobile-device:px-2 mobile-device:text-[10px]',
    active: 'bg-[#c7a762] text-[#12150f] shadow-[0_5px_18px_#0006]',
    inactive: 'text-[#747b73] hover:text-[#d8d1bf]',
  },
  boxed: {
    root: 'inline-flex max-w-full overflow-x-auto rounded-lg border border-[#3a4039] bg-[#111611] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    button: 'shrink-0 whitespace-nowrap rounded-md px-4 py-2 text-[11px] tracking-[.16em] transition-colors max-sm:px-2 max-sm:text-[10px] mobile-device:px-2 mobile-device:text-[10px]',
    active: 'bg-[#c7a762] text-[#12150f]',
    inactive: 'text-[#858b83] hover:text-[#ddd5bf]',
  },
}

export default function SegmentedControl({
  items,
  activeId,
  onChange,
  variant = 'pill',
  ariaLabel = '选项切换',
  className = '',
}) {
  const style = styles[variant] ?? styles.pill

  return (
    <div className={`${style.root} ${className}`} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`${style.button} ${active ? style.active : style.inactive}`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
