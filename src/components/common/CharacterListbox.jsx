import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import useCharacterListbox from '../../hooks/useCharacterListbox'
import CharacterListboxPanel from './CharacterListboxPanel'

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
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const controller = useCharacterListbox({
    cards,
    currentCard,
    isDisabled,
    onSelect,
    closeOnSelect,
  })
  const {
    closeList,
    handleTriggerKeyDown,
    isOpen,
    listboxId,
    openList,
    rootRef,
    triggerRef,
  } = controller
  const shouldPortalPanel = typeof document !== 'undefined'
    && document.documentElement.classList.contains('mobile-device')

  const panel = isOpen && (
    <CharacterListboxPanel
      {...controller}
      closeOnSelect={closeOnSelect}
      currentCard={currentCard}
      listLabel={listLabel}
      selectedIdSet={selectedIdSet}
    />
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

      {panel && (shouldPortalPanel ? createPortal(panel, document.body) : panel)}
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
