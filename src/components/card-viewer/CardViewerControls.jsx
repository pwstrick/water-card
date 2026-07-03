import FaceButton from '../common/FaceButton'

export default function CardViewerControls({
  isBack,
  isFocusMode,
  interactionMode,
  zoom,
  canZoomOut,
  canZoomIn,
  showDownload,
  onFaceChange,
  onZoomChange,
  onDownload,
}) {
  return (
    <div className={`legacy-center-x absolute left-1/2 z-20 flex w-max max-w-[calc(100vw-16px)] items-center justify-center gap-5 whitespace-nowrap max-sm:gap-1.5 mobile-device:gap-1.5 ${isFocusMode ? 'bottom-6' : 'bottom-[-52px] max-sm:bottom-[-45px] mobile-device:bottom-[-45px]'}`}>
      <FaceButton label="正面" mark="正" active={!isBack} onClick={() => onFaceChange(0)} />
      <div className="flex shrink-0 items-center gap-3 text-[#a8aa9f]">
        <i className="font-sans text-[22px] not-italic text-[#c7a762]">↔</i>
        <span className="text-[11px] leading-tight tracking-[.12em] max-sm:hidden mobile-device:hidden">
          {isFocusMode ? `拖动${interactionMode === 'pan' ? '移动' : '翻转'}` : '拖动翻转'}
          <br />
          <small className="font-mono text-[8px] tracking-[.08em] text-[#596059]">{isFocusMode ? '顶部按钮切换模式' : '滚轮 / 双指放大'}</small>
        </span>
      </div>
      <FaceButton label="背面" mark="背" active={isBack} onClick={() => onFaceChange(180)} />
      <Divider />
      <ZoomButton label="缩小卡片" mark="−" onClick={() => onZoomChange(-1)} disabled={!canZoomOut} />
      <span className="min-w-9 shrink-0 text-center font-mono text-[9px] text-[#8d938b]" aria-live="polite">{Math.round(zoom * 100)}%</span>
      <ZoomButton label="放大卡片" mark="＋" onClick={() => onZoomChange(1)} disabled={!canZoomIn} />
      {showDownload && (
        <>
          <Divider />
          <ActionButton label="下载当前样子的卡片" mark="↓" onClick={onDownload} />
        </>
      )}
    </div>
  )
}

function Divider() {
  return <span className="h-6 w-px shrink-0 bg-[#414740]" aria-hidden="true" />
}

function ZoomButton({ label, mark, onClick, disabled }) {
  return (
    <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#555c55] bg-transparent font-sans text-lg text-[#c7a762] transition-colors hover:border-[#c7a762] hover:bg-[#c7a76214] disabled:cursor-not-allowed disabled:opacity-30" aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      {mark}
    </button>
  )
}

function ActionButton({ label, mark, onClick }) {
  return (
    <button type="button" className="flex h-8 shrink-0 items-center gap-2 rounded-full border border-[#555c55] bg-transparent px-3 font-serif text-[10px] tracking-[.12em] text-[#c7a762] transition-colors hover:border-[#c7a762] hover:bg-[#c7a76214]" aria-label={label} title={label} onClick={onClick}>
      <span className="font-sans text-base leading-none">{mark}</span>
      <span className="max-sm:hidden mobile-device:hidden">下载</span>
    </button>
  )
}
