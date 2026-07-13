import { useCallback, useEffect, useRef, useState } from 'react'
import { CARD_ZOOM_LIMITS, createThreeCardScene } from './threeCardScene'
import { isUcBrowser } from '../../utils/device'
import useRetryableImageSource from '../../hooks/useRetryableImageSource'

// 这些元素拥有自己的键盘语义，聚焦时不应同时触发卡片旋转、翻面或缩放。
const INTERACTIVE_ELEMENT_SELECTOR = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="listbox"]',
  '[role="option"]',
  '[role="tab"]',
].join(',')

function shouldIgnoreViewerShortcut(event) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return true
  return event.target instanceof Element && Boolean(event.target.closest(INTERACTIVE_ELEMENT_SELECTOR))
}

export default function useCardViewer(card) {
  const mountRef = useRef(null)
  const viewerRef = useRef(null)
  const interactionModeRef = useRef('pan')
  const [angle, setAngle] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [facingBack, setFacingBack] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [loadState, setLoadState] = useState('loading')
  const [interactionMode, setInteractionMode] = useState('pan')
  const ucBrowser = isUcBrowser()
  const { imageSource, retry: retryLoad, isAutoRetrying } = useRetryableImageSource(
    loadState,
    card.images.source,
  )

  const goTo = useCallback((nextAngle) => viewerRef.current?.goTo(nextAngle), [])
  const changeZoom = useCallback((direction) => viewerRef.current?.changeZoom(direction), [])
  const resetView = useCallback(() => {
    interactionModeRef.current = 'pan'
    setInteractionMode('pan')
    viewerRef.current?.reset()
  }, [])
  const downloadView = useCallback(() => viewerRef.current?.download(), [])
  const selectInteractionMode = useCallback((mode) => {
    interactionModeRef.current = mode
    setInteractionMode(mode)
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const viewer = createThreeCardScene({
      mount,
      interactionModeRef,
      onAngleChange: setAngle,
      onZoomChange: setZoom,
      onFacingBackChange: setFacingBack,
      onDraggingChange: setDragging,
      onLoadStateChange: setLoadState,
    })
    viewerRef.current = viewer

    return () => {
      if (viewerRef.current === viewer) viewerRef.current = null
      viewer.dispose()
    }
  }, [])

  useEffect(() => {
    viewerRef.current?.updateCard({
      ...card,
      images: { ...card.images, source: imageSource },
    })
  }, [card, imageSource])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (shouldIgnoreViewerShortcut(event)) return

      if (event.key === 'ArrowLeft') goTo(angle - 30)
      else if (event.key === 'ArrowRight') goTo(angle + 30)
      else if (event.key === ' ') goTo(angle > 90 && angle < 270 ? 0 : 180)
      else if (event.key === '+' || event.key === '=') changeZoom(1)
      else if (event.key === '-' || event.key === '_') changeZoom(-1)
      else if (event.key === 'Escape') resetView()
      else return

      // 避免方向键和空格在操作卡片的同时滚动页面。
      event.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [angle, changeZoom, goTo, resetView])

  return {
    mountRef,
    angle,
    zoom,
    isBack: facingBack,
    dragging,
    loadState,
    isAutoRetrying,
    interactionMode,
    isFocusMode: zoom > 1.08,
    isUcBrowser: ucBrowser,
    canZoomOut: zoom > CARD_ZOOM_LIMITS.min + 0.02,
    canZoomIn: zoom < CARD_ZOOM_LIMITS.max - 0.05,
    goTo,
    changeZoom,
    resetView,
    downloadView,
    retryLoad,
    selectInteractionMode,
  }
}
