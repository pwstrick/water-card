import CharacterSwitch from './CharacterSwitch'
import OperationTips from './common/OperationTips'
import { CARD_VIEWER_OPERATION_TIPS } from '../config/operationTips'
import { getCardBadgeClass } from '../config/cardPresentation'

export default function CardDetails({ card, cards, collection, onCardChange }) {
  const stats = card.kind === 'villain'
    ? [['身份', card.identity], ['系列', card.series]]
    : [['绰号', card.nickname], ['星号', card.star]]

  return (
    <aside
      id="details"
      className="relative border-l border-[#e6dfcb1f] bg-[#080b0940] px-[38px] pb-9 pt-8 max-lg:border-l-0 max-lg:border-t max-sm:px-6 max-sm:py-6 mobile-device:border-l-0 mobile-device:border-t mobile-device:px-6 mobile-device:py-6"
    >
      <div className="desktop-character-switch mb-8 hidden lg:block">
        <CharacterSwitch card={card} cards={cards} onCardChange={onCardChange} />
      </div>

      <div className="mb-10 font-mono text-[46px] tracking-[-.06em] text-[#dad3bf] max-lg:mb-8 max-sm:text-[34px] mobile-device:mb-8 mobile-device:text-[34px]">
        {card.displayId ?? card.id}
        <span className={`ml-3 inline-flex -translate-y-2 rounded-full border px-2.5 py-1 font-serif text-[9px] tracking-[.18em] ${getCardBadgeClass(collection, card)}`}>
          {collection.label}{card.edition ? ` · ${card.edition}` : ''}
        </span>
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

      <section className="border-b border-[#30352f] py-5" aria-labelledby="hero-introduction-title">
        <h2 id="hero-introduction-title" className="mb-3 mt-0 text-[9px] font-normal tracking-[.3em] text-[#686f68]">人物简介</h2>
        <p className="m-0 text-xs leading-6 tracking-[.08em] text-[#aaa89f]">{card.introduction}</p>
      </section>

      <OperationTips items={CARD_VIEWER_OPERATION_TIPS} className="mt-10" />
    </aside>
  )
}
