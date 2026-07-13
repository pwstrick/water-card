import { useCallback, useMemo, useState } from 'react'
import { getCardSearchText, normalizeSearchText } from '../utils/cardSearch'

export default function useSearchableListbox({ cards, currentCard, isDisabled }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  // 卡片资料较多，先为整套卡建立搜索文本，输入时只做 includes 过滤。
  const searchableCards = useMemo(() => cards.map((card) => ({
    card,
    searchText: getCardSearchText(card),
  })), [cards])
  const normalizedQuery = normalizeSearchText(searchQuery)
  const filteredCards = useMemo(() => {
    if (!normalizedQuery) return cards
    return searchableCards
      .filter(({ searchText }) => searchText.includes(normalizedQuery))
      .map(({ card }) => card)
  }, [cards, normalizedQuery, searchableCards])
  const currentIndex = Math.max(0, filteredCards.findIndex((card) => card.id === currentCard.id))

  const cardIsDisabled = useCallback(
    (card) => !card || (isDisabled?.(card) ?? false),
    [isDisabled],
  )

  const findEnabledIndex = useCallback((startIndex, direction, includeStart = false) => {
    if (filteredCards.length === 0) return -1
    // 环形查找保证上一位/下一位能越过列表边界，并自动跳过禁用项。
    for (let offset = includeStart ? 0 : 1; offset <= filteredCards.length; offset += 1) {
      const index = (startIndex + direction * offset + filteredCards.length) % filteredCards.length
      if (!cardIsDisabled(filteredCards[index])) return index
    }
    return -1
  }, [cardIsDisabled, filteredCards])

  const resetSearch = useCallback(() => setSearchQuery(''), [])

  return {
    activeIndex,
    cardIsDisabled,
    currentIndex,
    filteredCards,
    findEnabledIndex,
    resetSearch,
    searchQuery,
    setActiveIndex,
    setSearchQuery,
  }
}
