import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { getListboxNavigationIndex } from '../utils/listboxNavigation'
import useSearchableListbox from './useSearchableListbox'

const shouldFocusSearchOnOpen = () => !document.documentElement.classList.contains('mobile-device')

export default function useCharacterListbox({
  cards,
  currentCard,
  isDisabled,
  onSelect,
  closeOnSelect,
}) {
  // DOM 引用集中在控制器中，桌面下拉层和移动端 Portal 共用同一套焦点管理。
  const [isOpen, setIsOpen] = useState(false)
  const listboxId = useId()
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)
  const searchRef = useRef(null)
  const listRef = useRef(null)
  const optionRefs = useRef([])
  const {
    activeIndex,
    cardIsDisabled,
    currentIndex,
    filteredCards,
    findEnabledIndex,
    resetSearch,
    searchQuery,
    setActiveIndex,
    setSearchQuery,
  } = useSearchableListbox({ cards, currentCard, isDisabled })

  const closeList = useCallback(({ restoreFocus = false } = {}) => {
    setIsOpen(false)
    resetSearch()
    if (restoreFocus) triggerRef.current?.focus()
  }, [resetSearch])

  const focusOption = useCallback((index) => {
    if (index < 0) return
    setActiveIndex(index)
    const option = optionRefs.current[index]
    const list = listRef.current
    option?.focus()
    if (!option || !list) return
    // roving tabindex 改变焦点后，手动保持选项完整可见。
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight
    }
  }, [setActiveIndex])

  const openList = useCallback((preferredIndex = currentIndex) => {
    resetSearch()
    const nextIndex = findEnabledIndex(preferredIndex, 1, true)
    if (nextIndex < 0) return
    setActiveIndex(nextIndex)
    setIsOpen(true)
  }, [currentIndex, findEnabledIndex, resetSearch, setActiveIndex])

  const selectCard = useCallback((card) => {
    if (!card || cardIsDisabled(card)) return
    onSelect(card)
    if (closeOnSelect) closeList({ restoreFocus: true })
  }, [cardIsDisabled, closeList, closeOnSelect, onSelect])

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (rootRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return
      closeList()
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeList({ restoreFocus: true })
    }

    // Portal 面板不在 rootRef 子树中，所以外部点击判断必须同时检查 panelRef。
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    const frame = requestAnimationFrame(() => {
      if (shouldFocusSearchOnOpen()) searchRef.current?.focus()
    })

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [closeList, isOpen])

  useEffect(() => {
    if (!isOpen) return
    optionRefs.current = optionRefs.current.slice(0, filteredCards.length)
    const nextIndex = findEnabledIndex(Math.min(activeIndex, filteredCards.length - 1), 1, true)
    setActiveIndex(Math.max(0, nextIndex))
  }, [activeIndex, filteredCards, findEnabledIndex, isOpen, setActiveIndex])

  const handleTriggerKeyDown = (event) => {
    const nextIndex = getListboxNavigationIndex({
      key: event.key,
      startIndex: currentIndex,
      itemCount: filteredCards.length,
      findEnabledIndex,
      includeStart: true,
    })
    if (nextIndex < 0) return
    event.preventDefault()
    openList(nextIndex)
  }

  const handleSearchKeyDown = (event) => {
    const nextIndex = getListboxNavigationIndex({
      key: event.key,
      startIndex: activeIndex,
      itemCount: filteredCards.length,
      findEnabledIndex,
      includeStart: true,
    })
    if (nextIndex >= 0) {
      event.preventDefault()
      focusOption(nextIndex)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      selectCard(filteredCards[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeList({ restoreFocus: true })
    }
  }

  const handleListKeyDown = (event) => {
    const nextIndex = getListboxNavigationIndex({
      key: event.key,
      startIndex: activeIndex,
      itemCount: filteredCards.length,
      findEnabledIndex,
    })
    if (nextIndex >= 0) {
      event.preventDefault()
      focusOption(nextIndex)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectCard(filteredCards[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeList({ restoreFocus: true })
    } else if (event.key === 'Tab') closeList()
  }

  return {
    activeIndex,
    cardIsDisabled,
    closeList,
    filteredCards,
    handleListKeyDown,
    handleSearchKeyDown,
    handleTriggerKeyDown,
    isOpen,
    listRef,
    listboxId,
    openList,
    optionRefs,
    panelRef,
    rootRef,
    searchQuery,
    searchRef,
    selectCard,
    setActiveIndex,
    setSearchQuery,
    triggerRef,
  }
}
