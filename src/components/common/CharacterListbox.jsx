import { useEffect, useId, useMemo, useRef, useState } from 'react'

export default function CharacterListbox({
  cards,
  currentCard,
  selectedIds = [],
  onSelect,
  isDisabled,
  closeOnSelect = true,
  triggerLabel = '选择水浒人物',
  listLabel = '水浒人物列表',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const listboxId = useId()
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const optionRefs = useRef([])
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const currentIndex = Math.max(0, cards.findIndex((card) => card.id === currentCard.id))

  const cardIsDisabled = (card) => !card || (isDisabled?.(card) ?? false)

  const findEnabledIndex = (startIndex, direction, includeStart = false) => {
    if (cards.length === 0) return -1
    for (let offset = includeStart ? 0 : 1; offset <= cards.length; offset += 1) {
      const index = (startIndex + direction * offset + cards.length) % cards.length
      if (!cardIsDisabled(cards[index])) return index
    }
    return -1
  }

  const focusOption = (index) => {
    if (index < 0) return
    setActiveIndex(index)
    const option = optionRefs.current[index]
    const list = listRef.current
    option?.focus()
    if (!option || !list) return
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight
    }
  }

  const openList = (preferredIndex = currentIndex) => {
    const nextIndex = findEnabledIndex(preferredIndex, 1, true)
    if (nextIndex < 0) return
    setActiveIndex(nextIndex)
    setIsOpen(true)
  }

  const selectCard = (card) => {
    if (!card || cardIsDisabled(card)) return
    onSelect(card)
    if (!closeOnSelect) return
    setIsOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    // 等列表完成挂载后，再聚焦键盘活动项并移到可视区域中央。
    const frame = requestAnimationFrame(() => {
      const activeItem = optionRefs.current[activeIndex]
      if (activeItem && listRef.current) {
        activeItem.focus()
        listRef.current.scrollTop = activeItem.offsetTop - listRef.current.clientHeight / 2
      }
    })

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const handleTriggerKeyDown = (event) => {
    let nextIndex = -1
    if (event.key === 'ArrowDown') nextIndex = findEnabledIndex(currentIndex, 1, true)
    else if (event.key === 'ArrowUp') nextIndex = findEnabledIndex(currentIndex, -1, true)
    else if (event.key === 'Home') nextIndex = findEnabledIndex(0, 1, true)
    else if (event.key === 'End') nextIndex = findEnabledIndex(cards.length - 1, -1, true)
    else return

    event.preventDefault()
    openList(nextIndex)
  }

  const handleListKeyDown = (event) => {
    let nextIndex = -1
    if (event.key === 'ArrowDown') nextIndex = findEnabledIndex(activeIndex, 1)
    else if (event.key === 'ArrowUp') nextIndex = findEnabledIndex(activeIndex, -1)
    else if (event.key === 'Home') nextIndex = findEnabledIndex(0, 1, true)
    else if (event.key === 'End') nextIndex = findEnabledIndex(cards.length - 1, -1, true)
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectCard(cards[activeIndex])
      return
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setIsOpen(false)
      triggerRef.current?.focus()
      return
    } else if (event.key === 'Tab') {
      setIsOpen(false)
      return
    } else return

    event.preventDefault()
    focusOption(nextIndex)
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={`flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg border bg-[#111611] px-3 text-left transition-colors ${isOpen ? 'border-[#9d8557] shadow-[0_0_0_2px_#9d85571f]' : 'border-[#3a4039] hover:border-[#655a43]'}`}
        aria-label={triggerLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
      >
        <CharacterSummary card={currentCard} />
        <span className={`shrink-0 text-[10px] text-[#9d8557] transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">▼</span>
      </button>

      {isOpen && (
        <div
          id={listboxId}
          ref={listRef}
          role="listbox"
          aria-label={listLabel}
          aria-multiselectable={!closeOnSelect || undefined}
          onKeyDown={handleListKeyDown}
          className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-72 w-full min-w-[220px] overflow-y-auto rounded-lg border border-[#504936] bg-[#0d110ef5] p-1.5 shadow-[0_20px_50px_#000c] backdrop-blur-md [scrollbar-color:#665a3d_#151a15] [scrollbar-width:thin]"
        >
          {cards.map((card, index) => {
            const current = card.id === currentCard.id
            const selected = selectedIdSet.has(card.id)
            const disabled = isDisabled?.(card) ?? false
            return (
              <button
                key={card.id}
                ref={(element) => { optionRefs.current[index] = element }}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={activeIndex === index ? 0 : -1}
                data-current={current}
                disabled={disabled}
                onFocus={() => setActiveIndex(index)}
                onClick={() => selectCard(card)}
                className={`flex w-full items-center rounded-md px-3 py-2.5 text-left text-xs transition-colors focus-visible:bg-[#b497542e] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#9d8557] disabled:cursor-not-allowed disabled:opacity-35 ${current ? 'bg-[#b497541f]' : 'hover:bg-[#ffffff0a]'}`}
              >
                <span className="w-10 shrink-0 font-mono text-[10px] text-[#73776d]">{card.displayId ?? card.id}</span>
                <span className={`min-w-0 flex-1 truncate ${selected ? 'text-[#c9ad65]' : 'text-[#b9b8ac]'}`}>{card.nickname}</span>
                <span className={`ml-3 shrink-0 ${selected ? 'text-[#c9ad65]' : 'text-[#b9b8ac]'}`}>{card.name}</span>
                {card.edition && <span className="ml-2 shrink-0 text-[9px] text-[#bc6757]">{card.edition}</span>}
                <span className={`ml-2 w-4 shrink-0 text-center text-[#c9ad65] ${selected ? 'opacity-100' : 'opacity-0'}`}>✓</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CharacterSummary({ card }) {
  return (
    <span className="min-w-0 truncate text-xs tracking-[.08em] text-[#d3b96f]">
      <span className="font-mono">{card.displayId ?? card.id}</span>
      <span className="mx-2 text-[#625b49]">·</span>
      <span>{card.nickname}</span>
      <span className="mx-2 text-[#625b49]">·</span>
      <span>{card.name}</span>
      {card.edition && <span className="ml-2 text-[9px] text-[#bc6757]">{card.edition}</span>}
    </span>
  )
}
