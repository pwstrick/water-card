import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import useSearchableListbox from '../../hooks/useSearchableListbox'
import { getListboxNavigationIndex } from '../../utils/listboxNavigation'

const shouldFocusSearchOnOpen = () => !document.documentElement.classList.contains('mobile-device')

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
  const listboxId = useId()
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)
  const searchRef = useRef(null)
  const listRef = useRef(null)
  const optionRefs = useRef([])
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const {
    activeIndex,
    cardIsDisabled,
    currentIndex,
    filteredCards,
    findEnabledIndex,
    resetSearch,
    searchQuery,
    setActiveIndex,
    setSearchQuery,
  } = useSearchableListbox({ cards, currentCard, isDisabled })

  const closeList = useCallback(({ restoreFocus = false } = {}) => {
    setIsOpen(false)
    resetSearch()
    if (restoreFocus) triggerRef.current?.focus()
  }, [resetSearch])

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
    resetSearch()
    const nextIndex = findEnabledIndex(preferredIndex, 1, true)
    if (nextIndex < 0) return
    setActiveIndex(nextIndex)
    setIsOpen(true)
  }

  const selectCard = (card) => {
    if (!card || cardIsDisabled(card)) return
    onSelect(card)
    if (!closeOnSelect) return
    closeList({ restoreFocus: true })
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (rootRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return
      closeList()
    }
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      closeList({ restoreFocus: true })
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    // 等列表完成挂载后先聚焦搜索框，方便人物较多时快速过滤。
    const frame = requestAnimationFrame(() => {
      if (shouldFocusSearchOnOpen()) searchRef.current?.focus()
    })

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [closeList, isOpen])

  useEffect(() => {
    if (!isOpen) return
    optionRefs.current = optionRefs.current.slice(0, filteredCards.length)
    const nextIndex = findEnabledIndex(Math.min(activeIndex, filteredCards.length - 1), 1, true)
    setActiveIndex(Math.max(0, nextIndex))
  }, [activeIndex, filteredCards, findEnabledIndex, isOpen, setActiveIndex])

  const handleTriggerKeyDown = (event) => {
    const nextIndex = getListboxNavigationIndex({
      key: event.key,
      startIndex: currentIndex,
      itemCount: filteredCards.length,
      findEnabledIndex,
      includeStart: true,
    })
    if (nextIndex < 0) return

    event.preventDefault()
    openList(nextIndex)
  }

  const handleSearchKeyDown = (event) => {
    const nextIndex = getListboxNavigationIndex({
      key: event.key,
      startIndex: activeIndex,
      itemCount: filteredCards.length,
      findEnabledIndex,
      includeStart: true,
    })

    if (nextIndex >= 0) {
      event.preventDefault()
      focusOption(nextIndex)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      selectCard(filteredCards[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeList({ restoreFocus: true })
    }
  }

  const handleListKeyDown = (event) => {
    const nextIndex = getListboxNavigationIndex({
      key: event.key,
      startIndex: activeIndex,
      itemCount: filteredCards.length,
      findEnabledIndex,
    })

    if (nextIndex >= 0) {
      event.preventDefault()
      focusOption(nextIndex)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectCard(filteredCards[activeIndex])
      return
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeList({ restoreFocus: true })
      return
    } else if (event.key === 'Tab') {
      closeList()
      return
    } else return
  }

  const shouldPortalPanel = typeof document !== 'undefined' && document.documentElement.classList.contains('mobile-device')
  const listboxPanel = isOpen && (
    <div
      ref={panelRef}
      className="absolute left-0 top-[calc(100%+8px)] z-50 w-full min-w-[240px] rounded-lg border border-[#504936] bg-[#0d110ef5] p-1.5 shadow-[0_20px_50px_#000c] backdrop-blur-md mobile-device:fixed mobile-device:inset-0 mobile-device:z-[80] mobile-device:flex mobile-device:min-h-dvh mobile-device:w-screen mobile-device:min-w-0 mobile-device:flex-col mobile-device:rounded-none mobile-device:border-0 mobile-device:bg-[#070a08f7] mobile-device:p-4 mobile-device:shadow-none"
    >
      <div className="hidden mobile-device:mb-3 mobile-device:flex mobile-device:items-center mobile-device:justify-between mobile-device:gap-3">
        <span className="min-w-0 truncate text-xs tracking-[.18em] text-[#d3b96f]">{listLabel}</span>
        <button
          type="button"
          onClick={() => closeList({ restoreFocus: true })}
          className="shrink-0 rounded-full border border-[#504936] bg-[#111611] px-4 py-2 text-[10px] tracking-[.14em] text-[#c9ad65] transition-colors hover:border-[#9d8557] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9d855766]"
        >
          完成
        </button>
      </div>
      <input
        ref={searchRef}
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        onKeyDown={handleSearchKeyDown}
        placeholder="搜索中文或拼音"
        className="mb-1.5 h-9 w-full rounded-md border border-[#3a4039] bg-[#090d0af2] px-3 text-xs tracking-[.06em] text-[#d8d1bf] outline-none transition placeholder:text-[#686f68] focus:border-[#9d8557] focus:ring-1 focus:ring-[#9d855766]"
        aria-label="搜索人物"
      />
      <div
        id={listboxId}
        ref={listRef}
        role="listbox"
        aria-label={listLabel}
        aria-multiselectable={!closeOnSelect || undefined}
        onKeyDown={handleListKeyDown}
        className="max-h-64 overflow-y-auto [scrollbar-color:#665a3d_#151a15] [scrollbar-width:thin] mobile-device:max-h-none mobile-device:min-h-0 mobile-device:flex-1 mobile-device:overscroll-contain"
      >
        {filteredCards.map((card, index) => {
          const current = card.id === currentCard.id
          const selected = selectedIdSet.has(card.id)
          const disabled = cardIsDisabled(card)
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
              <span className={`min-w-0 flex-1 truncate ${selected ? 'text-[#c9ad65]' : 'text-[#b9b8ac]'}`}>{card.nickname ?? card.identity}</span>
              <span className={`ml-3 shrink-0 ${selected ? 'text-[#c9ad65]' : 'text-[#b9b8ac]'}`}>{card.name}</span>
              {card.edition && <span className="ml-2 shrink-0 text-[9px] text-[#bc6757]">{card.edition}</span>}
              <span className={`ml-2 w-4 shrink-0 text-center text-[#c9ad65] ${selected ? 'opacity-100' : 'opacity-0'}`}>✓</span>
            </button>
          )
        })}
        {filteredCards.length === 0 && (
          <div className="px-3 py-5 text-center text-xs tracking-[.12em] text-[#777367]">没有匹配人物</div>
        )}
      </div>
    </div>
  )

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? closeList() : openList())}
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

      {listboxPanel && (shouldPortalPanel ? createPortal(listboxPanel, document.body) : listboxPanel)}
    </div>
  )
}

function CharacterSummary({ card }) {
  return (
    <span className="min-w-0 truncate text-xs tracking-[.08em] text-[#d3b96f]">
      <span className="font-mono">{card.displayId ?? card.id}</span>
      <span className="mx-2 text-[#625b49]">·</span>
      <span>{card.nickname ?? card.identity}</span>
      <span className="mx-2 text-[#625b49]">·</span>
      <span>{card.name}</span>
      {card.edition && <span className="ml-2 text-[9px] text-[#bc6757]">{card.edition}</span>}
    </span>
  )
}
