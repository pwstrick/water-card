import CharacterSwitch from './CharacterSwitch'

export default function CardDetails({ card, cards, collection, onCardChange }) {
  const stats = [
    ['绰号', card.nickname],
    ['星号', card.star],
  ]

  return (
    <aside
      id="details"
      className="relative border-l border-[#e6dfcb1f] bg-[#080b0940] px-[38px] pb-9 pt-8 max-lg:border-l-0 max-lg:border-t max-sm:px-6 max-sm:py-6"
    >
      <div className="mb-8 hidden lg:block">
        <CharacterSwitch card={card} cards={cards} onCardChange={onCardChange} />
      </div>

      <div className="mb-10 font-mono text-[46px] tracking-[-.06em] text-[#dad3bf] max-lg:mb-8 max-sm:text-[34px]">
        {card.id}
        <span className={`ml-3 inline-flex -translate-y-2 rounded-full border px-2.5 py-1 font-serif text-[9px] tracking-[.18em] ${
          collection.id === 'flash_prize'
            ? 'border-[#c7a76280] bg-[#c7a76214] text-[#d5b66f]'
            : 'border-[#73797066] text-[#858b83]'
        }`}>{collection.label}</span>
      </div>

      <div className="border-t border-[#30352f]">
        <p className="mb-0 py-5 text-[9px] tracking-[.3em] text-[#686f68]">基础信息</p>
        <div className="grid grid-cols-2">
          {stats.map(([label, value], index) => (
            <div
              key={label}
              className={`border-y border-[#30352f] py-[18px] ${index === 0 ? 'border-r' : 'pl-[18px]'}`}
            >
              <span className="mb-3 block text-[9px] tracking-[.3em] text-[#686f68]">{label}</span>
              <b className="text-xs font-medium text-[#c9c5b8]">{value}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 border-t border-[#30352f] pt-5">
        <span className="mb-3 block text-[9px] tracking-[.3em] text-[#686f68]">操作提示</span>
        <p className="m-0 text-xs leading-7 text-[#8e938b]">正常状态拖动旋转；放大后拖动查看局部，双指捏合缩放。</p>
      </div>
    </aside>
  )
}
