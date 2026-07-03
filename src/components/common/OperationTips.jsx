export default function OperationTips({ items, className = '' }) {
  return (
    <div className={`border-t border-[#30352f] pt-5 ${className}`}>
      <span className="mb-3 block text-[9px] tracking-[.3em] text-[#686f68]">操作提示</span>
      <ul className="m-0 space-y-2.5 p-0 text-xs leading-6 text-[#8e938b]">
        {items.map(([label, description]) => (
          <li key={label} className="flex list-none gap-2">
            <b className="shrink-0 font-medium text-[#c7a762]">{label}</b>
            <span>{description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
