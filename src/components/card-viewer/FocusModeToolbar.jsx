export default function FocusModeToolbar({ interactionMode, onModeChange, onExit }) {
  return (
    <>
      <div className="absolute left-6 top-6 z-30 flex rounded-full border border-[#e6dfcb33] bg-[#111511cc] p-1" role="group" aria-label="放大后的拖动模式">
        <ModeButton label="移动" active={interactionMode === 'pan'} onClick={() => onModeChange('pan')} />
        <ModeButton label="翻转" active={interactionMode === 'rotate'} onClick={() => onModeChange('rotate')} />
      </div>
      <button
        type="button"
        className="absolute right-6 top-6 z-30 flex items-center gap-2 rounded-full border border-[#e6dfcb33] bg-[#111511cc] px-4 py-2 text-[11px] tracking-[.18em] text-[#a9ada5] transition-colors hover:border-[#c7a762] hover:text-[#e6dfcb]"
        onClick={onExit}
        aria-label="退出放大模式"
      >
        <span className="font-sans text-base">×</span> 退出放大
      </button>
    </>
  )
}

function ModeButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[11px] tracking-[.16em] transition-colors ${active ? 'bg-[#c7a762] text-[#11150f]' : 'text-[#92988f] hover:text-[#e6dfcb]'}`}
    >
      {label}
    </button>
  )
}
