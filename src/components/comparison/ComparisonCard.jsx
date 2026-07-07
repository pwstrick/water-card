import { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import LoadingIndicator from '../common/LoadingIndicator'
import ImageLoadError from '../common/ImageLoadError'
import { getCardFaceBackgroundStyle } from '../../config/cardImageLayouts'
import useImageRetry from '../../hooks/useImageRetry'
import { getRetryImageSource } from '../../utils/imageSource'

export default function ComparisonCard({ card, comparisonKey, face, onRemove }) {
  const [loadState, setLoadState] = useState('loading')
  const [showActions, setShowActions] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const { attempt: loadAttempt, retry: retryLoad, isAutoRetrying } = useImageRetry(loadState, card.images.source)
  const imageSource = getRetryImageSource(card.images.source, loadAttempt)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: comparisonKey })
  const imageStyle = (side) => ({
    backgroundImage: `url("${imageSource}")`,
    backgroundRepeat: 'no-repeat',
    ...getCardFaceBackgroundStyle(card.images.layout, side),
  })

  const revealActions = () => {
    if (!isDragging && !isRemoving) setShowActions(!showActions)
  }

  const removeCard = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsRemoving(true)
    window.setTimeout(() => onRemove(comparisonKey), 220)
  }

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
    image.src = imageSource
    return () => {
      disposed = true
    }
  }, [imageSource])

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
      onClick={revealActions}
      role="listitem"
      aria-label={`${card.name}，拖动调整顺序`}
    >
      <div className={`comparison-card-scene relative mx-auto w-full max-w-[300px] transition-[opacity,transform,filter] duration-200 ease-out ${isRemoving ? 'translate-y-3 scale-95 opacity-0 blur-[1px]' : 'translate-y-0 scale-100 opacity-100'}`}>
        <div className={`comparison-card-inner ${face === 'back' ? 'is-back' : ''} ${loadState === 'ready' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="comparison-card-face" style={imageStyle('front')} aria-label={`${card.name}正面`}>
            {card.effects?.foil && (
              <span key={`flash-${face}`} className="flash-card-shine" aria-hidden="true" />
            )}
          </div>
          <div className="comparison-card-face comparison-card-back" style={imageStyle('back')} aria-label={`${card.name}背面`} />
        </div>
        {loadState === 'loading' && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-[5.5%] border border-[#e6dfcb1f] bg-[#0b0f0c]">
            <LoadingIndicator label={`${card.name}卡片加载中`} size="sm" glow showLabel={false} />
          </div>
        )}
        {loadState === 'error' && isAutoRetrying && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-[5.5%] border border-[#e6dfcb1f] bg-[#0b0f0c]">
            <LoadingIndicator label={`${card.name}卡片重新加载中`} size="sm" glow showLabel={false} />
          </div>
        )}
        {loadState === 'error' && !isAutoRetrying && (
          <ImageLoadError className="rounded-[5.5%] border border-[#bc675755]" onRetry={retryLoad} />
        )}
        {showActions && (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={removeCard}
            disabled={isRemoving}
            className={`absolute right-2 top-2 z-20 rounded-full border border-[#d58a79aa] bg-[#150c0bea] px-3 py-1.5 text-[10px] tracking-[.12em] text-[#f0b6a9] shadow-[0_8px_24px_#0009] backdrop-blur transition-all duration-150 hover:border-[#f0b6a9] hover:bg-[#2a1210] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d58a7980] ${isRemoving ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}
            aria-label={`将${card.name}移出对比区`}
          >
            删除
          </button>
        )}
      </div>
    </article>
  )
}
