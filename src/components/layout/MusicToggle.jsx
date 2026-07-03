import { useRef, useState } from 'react'

export default function MusicToggle() {
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
