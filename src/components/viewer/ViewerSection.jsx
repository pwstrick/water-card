import { lazy, Suspense, useState } from 'react'
import CardDetails from '../CardDetails'
import CharacterSwitch from '../CharacterSwitch'
import LoadingIndicator from '../common/LoadingIndicator'
import SegmentedControl from '../common/SegmentedControl'
import CharacterHeroInfo from './CharacterHeroInfo'
import { DEFAULT_CARD_ID, DEFAULT_COLLECTION_ID } from '../../data/collections'
import { resolveCardSelection } from '../../data/cardCatalog'

// Three.js 体积较大，延迟加载可先展示页面框架和人物信息。
const CardViewer = lazy(() => import('../card-viewer/CardViewer'))

export default function ViewerSection({ collections }) {
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [selectedCardId, setSelectedCardId] = useState(DEFAULT_CARD_ID)
  const { collection, card } = resolveCardSelection(collections, collectionId, selectedCardId)

  return (
    <main className="relative grid min-h-[calc(100vh-132px)] grid-cols-[minmax(620px,1fr)_380px] max-lg:grid-cols-1 mobile-device:grid-cols-1">
      <section id="viewer" className="viewer relative min-h-[720px] overflow-hidden px-[5vw] pb-8 pt-[62px] sm:max-lg:min-h-[784px] max-sm:min-h-[700px] max-sm:px-[18px] max-sm:py-[30px] mobile-device:min-h-[700px] mobile-device:px-[18px] mobile-device:py-[30px]">
        <SegmentedControl items={collections} activeId={collection.id} onChange={setCollectionId} ariaLabel="卡片分类" />
        <div className="mobile-character-switch relative z-20 mx-auto mt-4 w-full max-w-[420px] rounded-xl border border-[#e6dfcb1f] bg-[#080b09d9] p-3 backdrop-blur sm:max-w-[680px] lg:hidden">
          <CharacterSwitch card={card} cards={collection.cards} onCardChange={setSelectedCardId} />
        </div>
        <CharacterHeroInfo card={card} />
        <Suspense fallback={<CardViewerFallback />}>
          <CardViewer card={card} />
        </Suspense>
      </section>
      <CardDetails
        card={card}
        cards={collection.cards}
        collection={collection}
        onCardChange={setSelectedCardId}
      />
    </main>
  )
}

function CardViewerFallback() {
  return (
    <div className="absolute inset-[70px_5%_80px_30%] grid place-items-center max-lg:inset-[70px_2%_80px_28%] sm:max-lg:translate-y-16 max-sm:inset-[150px_0_80px] mobile-device:inset-[150px_0_80px]">
      <LoadingIndicator label="预览加载中…" panel labelClassName="text-[11px] tracking-[.28em]" />
    </div>
  )
}
