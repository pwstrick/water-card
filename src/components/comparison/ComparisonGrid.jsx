import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  SortableContext,
} from '@dnd-kit/sortable'
import ComparisonCard from './ComparisonCard'

export default function ComparisonGrid({ cards, face, onReorder }) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (cards.length === 0) {
    return <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-[#3a4039] text-xs tracking-[.18em] text-[#686f68]">请选择人物加入对比</div>
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => onReorder(active.id, over?.id)}
    >
      <SortableContext items={cards.map(({ key }) => key)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,300px))] justify-center gap-6 max-sm:grid-cols-2 max-sm:gap-3 mobile-device:grid-cols-2 mobile-device:gap-3" role="list" aria-label="已选对比卡片，可拖动排序">
          {cards.map(({ key, card }) => (
            <ComparisonCard
              key={key}
              comparisonKey={key}
              card={card}
              face={face}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
