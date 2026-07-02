import { useEffect, useRef, useState } from 'react'

export default function CharacterSwitch({ card, cards, onCardChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const currentIndex = cards.findIndex((item) => item.id === card.id)

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    requestAnimationFrame(() => {
      const selectedItem = listRef.current?.querySelector('[aria-selected="true"]')
      if (selectedItem && listRef.current) {
        listRef.current.scrollTop = selectedItem.offsetTop - listRef.current.clientHeight / 2
      }
    })

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const selectOffset = (offset) => {
    const nextIndex = (currentIndex + offset + cards.length) % cards.length
    onCardChange(cards[nextIndex].id)
  }

  return (
    <div ref={rootRef}>
      <span className="mb-3 block text-[9px] tracking-[.3em] text-[#686f68]">切换人物</span>
      <div className="grid grid-cols-[42px_minmax(0,1fr)_42px] gap-2">
        <button
          type="button"
          onClick={() => selectOffset(-1)}
          className="rounded border border-[#3a4039] bg-[#111611] text-lg text-[#aaa694] transition hover:border-[#8a7650] hover:text-[#e0c887]"
          aria-label="上一位好汉"
        >
          ‹
        </button>
        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className={`flex h-full w-full min-w-0 items-center justify-between gap-2 rounded border bg-[#111611] px-3 text-left transition ${
              isOpen
                ? 'border-[#9d8557] shadow-[0_0_0_2px_#9d85571f]'
                : 'border-[#3a4039] hover:border-[#655a43]'
            }`}
            aria-label="选择水浒人物"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="min-w-0 truncate text-xs tracking-[.08em] text-[#d5cfbd]">
              <span className="font-mono text-[#d3b96f]">{card.displayId ?? card.id}</span>
              <span className="mx-2 text-[#625b49]">·</span>
              <span className="text-[#d3b96f]">{card.nickname}</span>
              <span className="mx-2 text-[#625b49]">·</span>
              <span className="text-[#d3b96f]">{card.name}</span>
              {card.edition && <span className="ml-2 text-[9px] text-[#bc6757]">{card.edition}</span>}
            </span>
            <span className={`shrink-0 text-[10px] text-[#9d8557] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {isOpen && (
            <div
              ref={listRef}
              role="listbox"
              aria-label="水浒人物列表"
              className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-72 w-full min-w-[220px] overflow-y-auto rounded-lg border border-[#504936] bg-[#0d110ee8] p-1.5 shadow-[0_20px_50px_#000c] backdrop-blur-md [scrollbar-color:#665a3d_#151a15] [scrollbar-width:thin]"
            >
              {cards.map((item) => {
                const selected = item.id === card.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onCardChange(item.id)
                      setIsOpen(false)
                    }}
                    className={`flex w-full items-center rounded-md px-3 py-2.5 text-left text-xs transition ${
                      selected
                        ? 'bg-[#b497541f]'
                        : 'hover:bg-[#ffffff0a]'
                    }`}
                  >
                    <span className="w-10 shrink-0 font-mono text-[10px] text-[#73776d]">{item.displayId ?? item.id}</span>
                    <span className={`min-w-0 flex-1 truncate ${selected ? 'text-[#c9ad65]' : 'text-[#b9b8ac]'}`}>{item.nickname}</span>
                    <span className={`ml-3 shrink-0 ${selected ? 'text-[#c9ad65]' : 'text-[#b9b8ac]'}`}>{item.name}</span>
                    {item.edition && <span className="ml-2 shrink-0 text-[9px] text-[#bc6757]">{item.edition}</span>}
                    {selected && <span className="ml-2 text-[#c9ad65]">✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => selectOffset(1)}
          className="rounded border border-[#3a4039] bg-[#111611] text-lg text-[#aaa694] transition hover:border-[#8a7650] hover:text-[#e0c887]"
          aria-label="下一位好汉"
        >
          ›
        </button>
      </div>
    </div>
  )
}
