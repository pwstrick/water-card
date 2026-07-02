/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2026-07-01 18:04:34
 * @LastEditTime: 2026-07-01 19:08:45
 * @Description: 
 * @FilePath: /strick/water_card/src/App.jsx
 */
import { useState } from 'react'
import CardViewer from './components/CardViewer'
import CardDetails from './components/CardDetails'
import CharacterSwitch from './components/CharacterSwitch'
import { cards as standardCards } from './data/standard'
import { cards as flashPrizeCards } from './data/flash_prize'

const collections = [
  { id: 'standard', label: '普卡', cards: standardCards },
  { id: 'flash_prize', label: '奖闪', cards: flashPrizeCards },
]

export default function App() {
  const [collectionId, setCollectionId] = useState('standard')
  const [selectedCardId, setSelectedCardId] = useState('001')
  const collection = collections.find((item) => item.id === collectionId) ?? collections[0]
  const card = collection.cards.find((item) => item.id === selectedCardId) ?? collection.cards[0]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_48%_40%,#202720_0,#101410_42%,#080a09_100%)] text-[#e6dfcb]">
      <div className="grain pointer-events-none fixed inset-0 z-50 opacity-[.09]" aria-hidden="true" />
      <Header />

      <main className="relative grid min-h-[calc(100vh-132px)] grid-cols-[minmax(620px,1fr)_330px] max-lg:grid-cols-1">
        <section id="viewer" className="viewer relative min-h-[720px] overflow-hidden px-[5vw] pb-8 pt-[62px] max-sm:min-h-[700px] max-sm:px-[18px] max-sm:py-[30px]">
          <CollectionSwitch
            collections={collections}
            activeId={collection.id}
            onChange={setCollectionId}
          />
          <div className="relative z-20 mt-4 max-w-[420px] rounded-xl border border-[#e6dfcb1f] bg-[#080b09d9] p-3 backdrop-blur lg:hidden">
            <CharacterSwitch card={card} cards={collection.cards} onCardChange={setSelectedCardId} />
          </div>
          <div className="absolute left-[6vw] top-[28%] z-[2] max-sm:hidden">
            <p className="mb-[15px] text-xs tracking-[.45em] text-[#9b9f96]">{card.nickname} · {card.star}</p>
            <h1 className="m-0 text-[clamp(58px,7vw,104px)] font-black leading-none tracking-[.08em] [text-shadow:0_12px_35px_#000] max-sm:text-[58px]">{card.name}</h1>
            <p className="font-mono text-[10px] tracking-[.35em] text-[#746f63]">{card.romanizedName} <em className="text-[#9a2e25]">·</em> NO. {card.displayId ?? card.id}{card.edition ? ` · ${card.edition}` : ''}</p>
          </div>
          <CardViewer key={`${collection.id}-${card.id}`} card={card} />
        </section>
        <CardDetails
          card={card}
          cards={collection.cards}
          collection={collection}
          onCardChange={setSelectedCardId}
        />
      </main>

      <footer className="flex h-11 items-center justify-center gap-5 border-t border-[#e6dfcb1a] font-mono text-[8px] tracking-[.25em] text-[#4f554f]">
        <span>盐汽水真好喝 * P.W.Strick</span>
      </footer>
    </div>
  )
}

function CollectionSwitch({ collections, activeId, onChange }) {
  return (
    <div className="relative z-20 inline-flex rounded-full border border-[#e6dfcb1f] bg-[#080b0980] p-1" role="tablist" aria-label="卡片分类">
      {collections.map((collection) => {
        const active = collection.id === activeId
        return (
          <button
            key={collection.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(collection.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[.18em] transition-all ${
              active
                ? 'bg-[#c7a762] text-[#12150f] shadow-[0_5px_18px_#0006]'
                : 'text-[#747b73] hover:text-[#d8d1bf]'
            }`}
          >
            {collection.label}
          </button>
        )
      })}
    </div>
  )
}

function Header() {
  return (
    <header className="relative z-10 flex h-[88px] items-center justify-between border-b border-[#e6dfcb1f] px-[5vw] max-sm:h-[68px] max-sm:px-5">
      <a className="flex items-center gap-[13px] text-inherit no-underline" href="#" aria-label="水浒卡鉴赏室首页">
        <span className="grid h-10 w-10 -rotate-3 place-items-center border border-[#bc6757] text-[23px] font-black text-[#d67b68]">浒</span>
        <span><b className="text-lg tracking-[.18em] max-sm:text-[15px]">水浒卡</b><small className="mt-[3px] block text-[9px] tracking-[.55em] text-[#747c73]">鉴赏室</small></span>
      </a>
      <nav className="absolute left-1/2 flex -translate-x-1/2 gap-12 max-sm:hidden" aria-label="主导航">
        <a className="border-b-2 border-[#c7a762] py-[35px] text-[13px] tracking-[.22em] text-[#e6dfcb] no-underline transition-colors" href="#viewer">鉴赏</a>
      </nav>
    </header>
  )
}
