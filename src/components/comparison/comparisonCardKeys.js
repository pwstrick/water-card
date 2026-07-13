import { findCardSelection } from '../../data/cardCatalog'

const KEY_SEPARATOR = ':'

// 同一人物在多个卡组中的 id 可能相同，因此排序键必须带上卡组 id。
export const createComparisonCardKey = (collectionId, cardId) => (
  `${collectionId}${KEY_SEPARATOR}${cardId}`
)

export const parseComparisonCardKey = (key) => {
  const separatorIndex = key.indexOf(KEY_SEPARATOR)
  if (separatorIndex < 0) return { collectionId: '', cardId: '' }

  return {
    collectionId: key.slice(0, separatorIndex),
    cardId: key.slice(separatorIndex + KEY_SEPARATOR.length),
  }
}

export const findComparisonCard = (collections, key) => {
  const { collectionId, cardId } = parseComparisonCardKey(key)
  return findCardSelection(collections, collectionId, cardId)
}
