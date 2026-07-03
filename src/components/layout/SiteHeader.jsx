import MusicToggle from './MusicToggle'

export default function SiteHeader() {
  return (
    <header className="relative z-10 flex h-[88px] items-center justify-between border-b border-[#e6dfcb1f] px-[5vw] max-sm:h-[68px] max-sm:px-5 mobile-device:h-[68px] mobile-device:px-5">
      <a className="flex items-center gap-[13px] text-inherit no-underline" href="#" aria-label="水浒卡鉴赏室首页">
        <span className="grid h-10 w-10 -rotate-3 place-items-center border border-[#bc6757] text-[23px] font-black text-[#d67b68]">浒</span>
        <span>
          <b className="text-lg tracking-[.18em] max-sm:text-[15px] mobile-device:text-[15px]">水浒卡</b>
          <small className="mt-[3px] block text-[9px] tracking-[.55em] text-[#747c73]">鉴赏室</small>
        </span>
      </a>
      <nav className="legacy-center-x absolute left-1/2 flex gap-12 max-sm:hidden mobile-device:hidden" aria-label="主导航">
        <a className="border-b-2 border-[#c7a762] py-[35px] text-[13px] tracking-[.22em] text-[#e6dfcb] no-underline transition-colors" href="#viewer">鉴赏</a>
        <a className="border-b-2 border-transparent py-[35px] text-[13px] tracking-[.22em] text-[#858b83] no-underline transition-colors hover:border-[#c7a76266] hover:text-[#e6dfcb]" href="#comparison">对比</a>
      </nav>
      <MusicToggle />
    </header>
  )
}
