export default function CharacterHeroInfo({ card }) {
  const subtitle = card.kind === 'villain'
    ? `${card.identity} · ${card.series}`
    : `${card.nickname} · ${card.star}`

  return (
    <div className="absolute left-[6vw] top-[28%] z-[2] max-sm:hidden mobile-device:hidden">
      <p className="mb-[15px] text-xs tracking-[.45em] text-[#9b9f96]">{subtitle}</p>
      <h1 className="m-0 text-[clamp(58px,7vw,104px)] font-black leading-none tracking-[.08em] [text-shadow:0_12px_35px_#000]">{card.name}</h1>
      <p className="font-mono text-[10px] tracking-[.35em] text-[#746f63]">
        {card.romanizedName} <em className="text-[#9a2e25]">·</em> NO. {card.displayId ?? card.id}{card.edition ? ` · ${card.edition}` : ''}
      </p>
    </div>
  )
}
