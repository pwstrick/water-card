import CharacterListbox from '../common/CharacterListbox'
import SegmentedControl from '../common/SegmentedControl'
import { MAX_COMPARISON_CARDS } from '../../data/collections'

export default function ComparisonPicker({
  collections,
  pickerCollection,
  pickerCard,
  selectedCardIds,
  selectedCount,
  selectionFull,
  onCollectionChange,
  onCardToggle,
}) {
  return (
    <div className="mb-10 rounded-2xl border border-[#e6dfcb1f] bg-[#090c0aa6] p-5">
      <div className="grid grid-cols-[auto_minmax(280px,340px)] justify-center gap-3 max-lg:grid-cols-1 mobile-device:grid-cols-1">
        <SegmentedControl
          items={collections}
          activeId={pickerCollection.id}
          onChange={onCollectionChange}
          variant="boxed"
          ariaLabel="对比卡片分类"
          className="justify-self-center"
        />

        <CharacterListbox
          key={pickerCollection.id}
          cards={pickerCollection.cards}
          currentCard={pickerCard}
          selectedIds={selectedCardIds}
          onSelect={onCardToggle}
          isDisabled={(card) => selectionFull && !selectedCardIds.includes(card.id)}
          closeOnSelect={false}
          triggerLabel="选择要加入对比的人物"
          listLabel="对比人物列表"
          className="w-full max-w-[300px] justify-self-center"
        />
      </div>
      <p className="mb-0 mt-3 text-right font-mono text-[9px] tracking-[.12em] text-[#596059] sm:text-center">已选择 {selectedCount} / {MAX_COMPARISON_CARDS}</p>
    </div>
  )
}
