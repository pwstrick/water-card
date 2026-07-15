import { useEffect, useRef, useState } from 'react'
import FaceButton from '../common/FaceButton'
import OperationTips from '../common/OperationTips'
import ComparisonGrid from './ComparisonGrid'
import ComparisonPicker from './ComparisonPicker'
import useComparisonCards from './useComparisonCards'
import { COMPARISON_OPERATION_TIPS } from '../../config/operationTips'
import { COMPARISON_EXIT_DURATION } from '../../config/comparison'

export default function ComparisonSection({ collections }) {
  const [face, setFace] = useState('front')
  const [isClearing, setIsClearing] = useState(false)
  const clearTimerRef = useRef(null)
  const {
    pickerCollection,
    pickerCard,
    selectedCards,
    selectedPickerCardIds,
    selectionFull,
    changePickerCollection,
    togglePickerCard,
    reorderCards,
    removeCard,
    clearCards,
    compareSameCharacter,
    comparePreviousCharacter,
    compareNextCharacter,
    canComparePrevious,
    canCompareNext,
  } = useComparisonCards(collections)

  useEffect(() => () => {
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current)
  }, [])

  const clearWithAnimation = () => {
    if (isClearing || selectedCards.length === 0) return
    setIsClearing(true)
    // 等 CSS 退出动画结束后再真正清空数据，避免卡片直接从 DOM 消失。
    clearTimerRef.current = window.setTimeout(() => {
      clearCards()
      setIsClearing(false)
      clearTimerRef.current = null
    }, COMPARISON_EXIT_DURATION)
  }

  return (
    <section className="border-t border-[#e6dfcb1f] px-[5vw] py-16 max-sm:px-[18px] max-sm:py-10 mobile-device:px-[18px] mobile-device:py-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-9">
          <h2 className="m-0 text-[clamp(34px,5vw,64px)] font-black tracking-[.12em]">对比区</h2>
        </div>

        <ComparisonPicker
          collections={collections}
          pickerCollection={pickerCollection}
          pickerCard={pickerCard}
          selectedCardIds={selectedPickerCardIds}
          selectedCount={selectedCards.length}
          selectionFull={selectionFull}
          onCollectionChange={changePickerCollection}
          onCardToggle={togglePickerCard}
        />

        <ComparisonGrid
          cards={selectedCards}
          face={face}
          onReorder={reorderCards}
          onRemove={removeCard}
          isClearing={isClearing}
        />

        {selectedCards.length > 0 && (
          <ComparisonFaceSwitch
            face={face}
            onChange={setFace}
            onComparePrevious={comparePreviousCharacter}
            onCompareSameCharacter={compareSameCharacter}
            onCompareNext={compareNextCharacter}
            canComparePrevious={canComparePrevious}
            canCompareNext={canCompareNext}
            onClear={clearWithAnimation}
            isClearing={isClearing}
          />
        )}

        <OperationTips items={COMPARISON_OPERATION_TIPS} className="mx-auto mt-12 max-w-[760px]" />
      </div>
    </section>
  )
}

function ComparisonFaceSwitch({
  face,
  onChange,
  onComparePrevious,
  onCompareSameCharacter,
  onCompareNext,
  canComparePrevious,
  canCompareNext,
  onClear,
  isClearing,
}) {
  return (
    <div className="mt-9 flex flex-wrap items-center justify-center gap-5 max-sm:gap-4 mobile-device:gap-4" role="group" aria-label="统一切换卡片正反面与同人物对比">
      <FaceButton label="正面" mark="正" size="md" active={face === 'front'} onClick={() => onChange('front')} />
      <span className="font-sans text-[22px] text-[#c7a762]" aria-hidden="true">↔</span>
      <FaceButton label="背面" mark="背" size="md" active={face === 'back'} onClick={() => onChange('back')} />
      <div className="flex items-center gap-5 max-sm:w-full max-sm:gap-3 mobile-device:w-full mobile-device:gap-3">
        <ComparisonActionButton onClick={onComparePrevious} disabled={!canComparePrevious}>
          上一组
        </ComparisonActionButton>
        <ComparisonActionButton onClick={onCompareSameCharacter}>
          同人物对比
        </ComparisonActionButton>
        <ComparisonActionButton onClick={onCompareNext} disabled={!canCompareNext}>
          下一组
        </ComparisonActionButton>
      </div>
      <ComparisonActionButton
        tone="danger"
        onClick={onClear}
        disabled={isClearing}
        active={isClearing}
        className="max-sm:w-full mobile-device:w-full"
      >
        {isClearing ? '清空中' : '清空对比区'}
      </ComparisonActionButton>
    </div>
  )
}

function ComparisonActionButton({ tone = 'gold', active = false, children, className = '', ...buttonProps }) {
  const tones = {
    gold: 'border-[#3a4039] bg-[#111611] text-[#c9ad65] hover:border-[#8a7650] hover:text-[#e0c887] focus-visible:ring-[#c7a76266]',
    danger: 'border-[#4d3430] bg-[#15100f] text-[#d58a79] hover:border-[#bc6757] hover:text-[#f0b6a9] focus-visible:ring-[#bc675766]',
  }
  const activeTone = tone === 'danger' ? 'border-[#bc6757] text-[#f0b6a9]' : 'border-[#8a7650] text-[#e0c887]'

  return (
    <button
      type="button"
      className={`min-h-10 rounded-md border px-5 text-[11px] tracking-[.16em] transition-[border-color,color,opacity,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:scale-95 disabled:opacity-55 max-sm:flex-1 max-sm:px-3 mobile-device:flex-1 mobile-device:px-3 ${tones[tone]} ${active ? activeTone : ''} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
