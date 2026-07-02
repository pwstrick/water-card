import CharacterSwitch from './CharacterSwitch'

const operationTips = [
  ['拖动', '正常状态下拖动可 360° 翻转卡片；放大后默认拖动查看局部，也可通过顶部的“移动 / 翻转”切换拖动模式。'],
  ['缩放', '使用鼠标滚轮、底部“− / ＋”按钮或双指捏合缩放；双指移动还可查看放大后的局部。'],
  ['正反面', '点击底部“正面 / 背面”快速切换，双击卡片也可翻面。'],
  ['键盘', '← / → 每次旋转 30°，空格键翻面，+ / − 缩放，Esc 退出放大。'],
  ['下载', '点击底部“下载”保存当前角度和缩放状态下的卡片图片。'],
]

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
        {card.displayId ?? card.id}
        <span className={`ml-3 inline-flex -translate-y-2 rounded-full border px-2.5 py-1 font-serif text-[9px] tracking-[.18em] ${
          collection.id === 'flash_prize'
            ? 'border-[#c7a76280] bg-[#c7a76214] text-[#d5b66f]'
            : 'border-[#73797066] text-[#858b83]'
        }`}>{collection.label}{card.edition ? ` · ${card.edition}` : ''}</span>
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
        <ul className="m-0 space-y-2.5 p-0 text-xs leading-6 text-[#8e938b]">
          {operationTips.map(([label, description]) => (
            <li key={label} className="flex list-none gap-2">
              <b className="shrink-0 font-medium text-[#c7a762]">{label}</b>
              <span>{description}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
