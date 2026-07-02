/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2026-07-01 18:04:34
 * @LastEditTime: 2026-07-01 19:08:45
 * @Description: 
 * @FilePath: /strick/water_card/src/App.jsx
 */
import { useRef, useState } from 'react'
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

      <main className="relative grid min-h-[calc(100vh-132px)] grid-cols-[minmax(620px,1fr)_330px] max-lg:grid-cols-1 mobile-device:grid-cols-1">
        <section id="viewer" className="viewer relative min-h-[720px] overflow-hidden px-[5vw] pb-8 pt-[62px] max-sm:min-h-[700px] max-sm:px-[18px] max-sm:py-[30px] mobile-device:min-h-[700px] mobile-device:px-[18px] mobile-device:py-[30px]">
          <CollectionSwitch
            collections={collections}
            activeId={collection.id}
            onChange={setCollectionId}
          />
          <div className="mobile-character-switch relative z-20 mt-4 max-w-[420px] rounded-xl border border-[#e6dfcb1f] bg-[#080b09d9] p-3 backdrop-blur lg:hidden">
            <CharacterSwitch card={card} cards={collection.cards} onCardChange={setSelectedCardId} />
          </div>
          <div className="absolute left-[6vw] top-[28%] z-[2] max-sm:hidden mobile-device:hidden">
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
    <header className="relative z-10 flex h-[88px] items-center justify-between border-b border-[#e6dfcb1f] px-[5vw] max-sm:h-[68px] max-sm:px-5 mobile-device:h-[68px] mobile-device:px-5">
      <a className="flex items-center gap-[13px] text-inherit no-underline" href="#" aria-label="水浒卡鉴赏室首页">
        <span className="grid h-10 w-10 -rotate-3 place-items-center border border-[#bc6757] text-[23px] font-black text-[#d67b68]">浒</span>
        <span><b className="text-lg tracking-[.18em] max-sm:text-[15px] mobile-device:text-[15px]">水浒卡</b><small className="mt-[3px] block text-[9px] tracking-[.55em] text-[#747c73]">鉴赏室</small></span>
      </a>
      <nav className="legacy-center-x absolute left-1/2 flex gap-12 max-sm:hidden mobile-device:hidden" aria-label="主导航">
        <a className="border-b-2 border-[#c7a762] py-[35px] text-[13px] tracking-[.22em] text-[#e6dfcb] no-underline transition-colors" href="#viewer">鉴赏</a>
      </nav>
      <MusicToggle />
    </header>
  )
}

function MusicToggle() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!audio.paused) {
      audio.pause()
      return
    }

    try {
      setFailed(false)
      await audio.play()
    } catch {
      setFailed(true)
      setPlaying(false)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}song.mp3`}
        preload="none"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        aria-label={playing ? '关闭背景音乐' : '开启背景音乐'}
        aria-pressed={playing}
        title={failed ? '音乐播放失败，请重试' : playing ? '关闭背景音乐' : '开启背景音乐'}
        onClick={toggleMusic}
        className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] tracking-[.15em] transition-colors max-sm:h-9 max-sm:w-9 max-sm:justify-center max-sm:p-0 mobile-device:h-9 mobile-device:w-9 mobile-device:justify-center mobile-device:p-0 ${
          playing
            ? 'border-[#c7a76299] bg-[#c7a76214] text-[#d8bd78]'
            : 'border-[#555c5566] text-[#747c73] hover:border-[#8a7650] hover:text-[#d8d1bf]'
        }`}
      >
        <span className={`font-sans text-base leading-none ${playing ? 'animate-pulse' : ''}`} aria-hidden="true">♫</span>
        <span className="max-sm:hidden mobile-device:hidden">{playing ? '播放中' : '背景音乐'}</span>
      </button>
    </>
  )
}
