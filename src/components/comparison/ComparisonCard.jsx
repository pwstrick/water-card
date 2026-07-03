import { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import LoadingIndicator from '../common/LoadingIndicator'
import { getCardFaceBackgroundStyle } from '../../config/cardImageLayouts'

export default function ComparisonCard({ card, comparisonKey, face }) {
  const [loadState, setLoadState] = useState('loading')
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: comparisonKey })
  const imageStyle = (side) => ({
    backgroundImage: `url("${card.images.source}")`,
    backgroundRepeat: 'no-repeat',
    ...getCardFaceBackgroundStyle(card.images.layout, side),
  })

  useEffect(() => {
    let disposed = false
    const image = new Image()
    setLoadState('loading')
    image.onload = () => {
      if (!disposed) setLoadState('ready')
    }
    image.onerror = () => {
      if (!disposed) setLoadState('error')
    }
    image.src = card.images.source
    return () => {
      disposed = true
    }
  }, [card.images.source])

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={`relative min-w-0 cursor-grab select-none [touch-action:pan-y] active:cursor-grabbing ${isDragging ? 'opacity-55' : 'opacity-100'}`}
      {...attributes}
      {...listeners}
      role="listitem"
      aria-label={`${card.name}，拖动调整顺序`}
    >
      <div className="comparison-card-scene relative mx-auto w-full max-w-[300px]">
        <div className={`comparison-card-inner ${face === 'back' ? 'is-back' : ''} ${loadState === 'ready' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="comparison-card-face" style={imageStyle('front')} aria-label={`${card.name}正面`} />
          <div className="comparison-card-face comparison-card-back" style={imageStyle('back')} aria-label={`${card.name}背面`} />
        </div>
        {loadState === 'loading' && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-[5.5%] border border-[#e6dfcb1f] bg-[#0b0f0c]">
            <LoadingIndicator label={`${card.name}卡片加载中`} size="sm" glow showLabel={false} />
          </div>
        )}
        {loadState === 'error' && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-[5.5%] border border-[#bc675755] bg-[#0b0f0c] text-xs tracking-[.12em] text-[#bc6757]" role="alert">图片加载失败</div>
        )}
      </div>
    </article>
  )
}
