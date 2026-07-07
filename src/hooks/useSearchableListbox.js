import { useCallback, useMemo, useState } from 'react'
import { getCardSearchText, normalizeSearchText } from '../utils/cardSearch'

export default function useSearchableListbox({ cards, currentCard, isDisabled }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const normalizedQuery = normalizeSearchText(searchQuery)
  const filteredCards = useMemo(() => {
    if (!normalizedQuery) return cards
    return cards.filter((card) => getCardSearchText(card).includes(normalizedQuery))
  }, [cards, normalizedQuery])
  const currentIndex = Math.max(0, filteredCards.findIndex((card) => card.id === currentCard.id))

  const cardIsDisabled = useCallback(
    (card) => !card || (isDisabled?.(card) ?? false),
    [isDisabled],
  )

  const findEnabledIndex = useCallback((startIndex, direction, includeStart = false) => {
    if (filteredCards.length === 0) return -1
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
