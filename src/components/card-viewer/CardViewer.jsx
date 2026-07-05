import LoadingIndicator from '../common/LoadingIndicator'
import ImageLoadError from '../common/ImageLoadError'
import CardViewerControls from './CardViewerControls'
import FocusModeToolbar from './FocusModeToolbar'
import useCardViewer from './useCardViewer'

export default function CardViewer({ card }) {
  const viewer = useCardViewer(card)

  return (
    <div
      className={`grid place-items-center transition-colors duration-300 ${
        viewer.isFocusMode
          ? 'fixed inset-0 z-40 bg-[#050705f2] backdrop-blur-sm'
          : 'absolute inset-[70px_5%_80px_30%] max-lg:inset-[70px_2%_80px_28%] sm:max-lg:translate-y-16 max-sm:inset-[150px_0_80px] mobile-device:inset-[150px_0_80px]'
      }`}
    >
      {viewer.isFocusMode && (
        <FocusModeToolbar
          interactionMode={viewer.interactionMode}
          onModeChange={viewer.selectInteractionMode}
          onExit={viewer.resetView}
        />
      )}

      <div
        className={`relative ${viewer.isFocusMode ? 'h-[calc(100vh-144px)] w-screen' : 'h-[590px] w-[420px] max-sm:h-[500px] max-sm:w-full mobile-device:h-[500px] mobile-device:w-full'} ${viewer.dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        aria-label={`${card.name}水浒卡 three.js 360度预览区，拖动旋转，滚轮或双指缩放`}
      >
        <div ref={viewer.mountRef} className="absolute inset-0 touch-none" />
        {viewer.loadState === 'loading' && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center" aria-live="polite">
            <LoadingIndicator
              label="卡片载入中…"
              panel
              glow
              showCore
              pulseLabel
              className="backdrop-blur-sm"
              labelClassName="text-[11px] tracking-[.28em]"
            />
          </div>
        )}
        {viewer.loadState === 'error' && viewer.isAutoRetrying && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#0b0f0c]">
            <LoadingIndicator label="加载失败，正在重试…" panel glow pulseLabel />
          </div>
        )}
        {viewer.loadState === 'error' && !viewer.isAutoRetrying && (
          <ImageLoadError message="卡片图片加载失败" onRetry={viewer.retryLoad} />
        )}
      </div>

      <AngleReadout angle={viewer.angle} isFocusMode={viewer.isFocusMode} />
      <CardViewerControls
        isBack={viewer.isBack}
        isFocusMode={viewer.isFocusMode}
        interactionMode={viewer.interactionMode}
        zoom={viewer.zoom}
        canZoomOut={viewer.canZoomOut}
        canZoomIn={viewer.canZoomIn}
        showDownload={!viewer.isUcBrowser}
        onFaceChange={viewer.goTo}
        onZoomChange={viewer.changeZoom}
        onDownload={viewer.downloadView}
      />
    </div>
  )
}

function AngleReadout({ angle, isFocusMode }) {
  return (
    <div className={`absolute w-[90px] text-right font-mono text-[9px] text-[#777f76] max-sm:hidden mobile-device:hidden ${isFocusMode ? 'bottom-8 right-8' : 'bottom-12 right-0'}`} aria-hidden="true">
      <span className="text-base text-[#c5bfae]">{angle}°</span>
      <div className="relative my-2.5 h-px bg-[#3d443e]">
        <i className="absolute top-[-2px] h-[5px] w-[5px] rounded-full bg-[#c7a762]" style={{ left: `${(angle / 360) * 100}%` }} />
      </div>
      <small className="tracking-[.15em]">360° THREE.JS</small>
    </div>
  )
}
