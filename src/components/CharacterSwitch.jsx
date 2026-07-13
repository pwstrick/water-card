import CharacterListbox from './common/CharacterListbox'

export default function CharacterSwitch({ card, cards, onCardChange }) {
  const currentIndex = cards.findIndex((item) => item.id === card.id)

  const selectOffset = (offset) => {
    // 加上 cards.length 后取模，让首尾人物可以循环切换。
    const nextIndex = (currentIndex + offset + cards.length) % cards.length
    onCardChange(cards[nextIndex].id)
  }

  return (
    <div>
      <span className="mb-3 block text-[9px] tracking-[.3em] text-[#686f68]">切换人物</span>
      <div className="grid grid-cols-[42px_minmax(0,1fr)_42px] gap-2">
        <button
          type="button"
          onClick={() => selectOffset(-1)}
          className="rounded border border-[#3a4039] bg-[#111611] text-lg text-[#aaa694] transition hover:border-[#8a7650] hover:text-[#e0c887]"
          aria-label="上一位人物"
        >
          ‹
        </button>
        <CharacterListbox
          cards={cards}
          currentCard={card}
          selectedIds={[card.id]}
          onSelect={(item) => onCardChange(item.id)}
          className="h-full"
        />
        <button
          type="button"
          onClick={() => selectOffset(1)}
          className="rounded border border-[#3a4039] bg-[#111611] text-lg text-[#aaa694] transition hover:border-[#8a7650] hover:text-[#e0c887]"
          aria-label="下一位人物"
        >
          ›
        </button>
      </div>
    </div>
  )
}
