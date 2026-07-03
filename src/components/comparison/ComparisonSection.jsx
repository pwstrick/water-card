import { useState } from 'react'
import FaceButton from '../common/FaceButton'
import OperationTips from '../common/OperationTips'
import ComparisonGrid from './ComparisonGrid'
import ComparisonPicker from './ComparisonPicker'
import useComparisonCards from './useComparisonCards'
import { COMPARISON_OPERATION_TIPS } from '../../config/operationTips'

export default function ComparisonSection({ collections }) {
  const [face, setFace] = useState('front')
  const {
    pickerCollection,
    pickerCard,
    selectedCards,
    selectedPickerCardIds,
    selectionFull,
    changePickerCollection,
    togglePickerCard,
    reorderCards,
  } = useComparisonCards(collections)

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

        <ComparisonGrid cards={selectedCards} face={face} onReorder={reorderCards} />

        {selectedCards.length > 0 && (
          <ComparisonFaceSwitch face={face} onChange={setFace} />
        )}

        <OperationTips items={COMPARISON_OPERATION_TIPS} className="mx-auto mt-12 max-w-[760px]" />
      </div>
    </section>
  )
}

function ComparisonFaceSwitch({ face, onChange }) {
  return (
    <div className="mt-9 flex items-center justify-center gap-5 max-sm:gap-4 mobile-device:gap-4" role="group" aria-label="统一切换卡片正反面">
      <FaceButton label="正面" mark="正" size="md" active={face === 'front'} onClick={() => onChange('front')} />
      <span className="font-sans text-[22px] text-[#c7a762]" aria-hidden="true">↔</span>
      <FaceButton label="背面" mark="背" size="md" active={face === 'back'} onClick={() => onChange('back')} />
    </div>
  )
}
