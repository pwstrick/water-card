import { useMemo, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { DEFAULT_COMPARISON_CARDS, MAX_COMPARISON_CARDS } from '../../data/collections'
import { findCharacterCards, resolveCardSelection } from '../../data/cardCatalog'
import {
  createComparisonCardKey,
  findComparisonCard,
  parseComparisonCardKey,
} from './comparisonCardKeys'

// 将配置对象预先转为拖拽列表使用的稳定键，后续状态只维护这一种数据格式。
const DEFAULT_SELECTED_KEYS = DEFAULT_COMPARISON_CARDS.map(({ collectionId, cardId }) => (
  createComparisonCardKey(collectionId, cardId)
))

export default function useComparisonCards(collections) {
  const [pickerCollectionId, setPickerCollectionId] = useState(collections[0].id)
  const [pickerCardId, setPickerCardId] = useState(collections[0].cards[0].id)
  const [selectedKeys, setSelectedKeys] = useState(DEFAULT_SELECTED_KEYS)

  const { collection: pickerCollection, card: pickerCard } = resolveCardSelection(
    collections,
    pickerCollectionId,
    pickerCardId,
  )
  const selectedCards = useMemo(() => selectedKeys.flatMap((key) => {
    // 数据更新后可能留下失效 key；flatMap 会安全忽略找不到的卡片。
    const { card } = findComparisonCard(collections, key)
    return card ? [{ key, card }] : []
  }), [collections, selectedKeys])

  const selectedPickerCardIds = selectedKeys.flatMap((key) => {
    const { collectionId, cardId } = parseComparisonCardKey(key)
    return collectionId === pickerCollection.id ? [cardId] : []
  })

  const changePickerCollection = (collectionId) => {
    const { collection: nextCollection } = resolveCardSelection(collections, collectionId)
    setPickerCollectionId(nextCollection.id)
    setPickerCardId(nextCollection.cards[0].id)
  }

  const togglePickerCard = (card) => {
    const key = createComparisonCardKey(pickerCollection.id, card.id)
    setPickerCardId(card.id)
    // 已选项再次点击表示移除；达到上限时保留原数组，避免无意义重渲染。
    setSelectedKeys((items) => items.includes(key)
      ? items.filter((item) => item !== key)
      : items.length < MAX_COMPARISON_CARDS ? [...items, key] : items)
  }

  const reorderCards = (activeKey, overKey) => {
    if (!overKey || activeKey === overKey) return
    setSelectedKeys((items) => {
      const oldIndex = items.indexOf(activeKey)
      const newIndex = items.indexOf(overKey)
      return oldIndex < 0 || newIndex < 0 ? items : arrayMove(items, oldIndex, newIndex)
    })
  }

  const removeCard = (key) => {
    setSelectedKeys((items) => items.filter((item) => item !== key))
  }

  const clearCards = () => {
    setSelectedKeys([])
  }

  const compareSameCharacter = () => {
    setSelectedKeys((items) => {
      const firstKey = items[0]
      if (!firstKey) return items

      const { collection: baseCollection, card: baseCard } = findComparisonCard(collections, firstKey)
      if (!baseCollection || !baseCard) return items

      const versions = findCharacterCards(collections, baseCard.name)
      // 将用户当前看到的版本放在首位，其余版本保持卡组配置顺序。
      versions.sort((left, right) => (
        Number(right.collection.id === baseCollection.id)
        - Number(left.collection.id === baseCollection.id)
      ))
      return versions.map(({ collection, card }) => createComparisonCardKey(collection.id, card.id))
    })
  }

  return {
    pickerCollection,
    pickerCard,
    selectedCards,
    selectedPickerCardIds,
    selectionFull: selectedKeys.length >= MAX_COMPARISON_CARDS,
    changePickerCollection,
    togglePickerCard,
    reorderCards,
    removeCard,
    clearCards,
    compareSameCharacter,
  }
}
