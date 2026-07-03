import { useMemo, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { DEFAULT_COMPARISON_CARDS, MAX_COMPARISON_CARDS } from '../../data/collections'

// 同一人物在普卡和奖闪中的 id 相同，因此排序键必须带上卡组 id。
const comparisonCardKey = (collectionId, cardId) => `${collectionId}:${cardId}`

// 将配置对象预先转为拖拽列表使用的稳定键，后续状态只维护这一种数据格式。
const DEFAULT_SELECTED_KEYS = DEFAULT_COMPARISON_CARDS.map(({ collectionId, cardId }) => (
  comparisonCardKey(collectionId, cardId)
))

export default function useComparisonCards(collections) {
  const [pickerCollectionId, setPickerCollectionId] = useState(collections[0].id)
  const [pickerCardId, setPickerCardId] = useState(collections[0].cards[0].id)
  const [selectedKeys, setSelectedKeys] = useState(DEFAULT_SELECTED_KEYS)

  const pickerCollection = collections.find((item) => item.id === pickerCollectionId) ?? collections[0]
  const pickerCard = pickerCollection.cards.find((item) => item.id === pickerCardId) ?? pickerCollection.cards[0]
  const selectedCards = useMemo(() => selectedKeys.flatMap((key) => {
    const [collectionId, cardId] = key.split(':')
    const collection = collections.find((item) => item.id === collectionId)
    const card = collection?.cards.find((item) => item.id === cardId)
    return card ? [{ key, card }] : []
  }), [collections, selectedKeys])

  const selectedPickerCardIds = selectedKeys.flatMap((key) => {
    const [collectionId, cardId] = key.split(':')
    return collectionId === pickerCollection.id ? [cardId] : []
  })

  const changePickerCollection = (collectionId) => {
    const nextCollection = collections.find((item) => item.id === collectionId) ?? collections[0]
    setPickerCollectionId(nextCollection.id)
    setPickerCardId(nextCollection.cards[0].id)
  }

  const togglePickerCard = (card) => {
    const key = comparisonCardKey(pickerCollection.id, card.id)
    setPickerCardId(card.id)
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

  return {
    pickerCollection,
    pickerCard,
    selectedCards,
    selectedPickerCardIds,
    selectionFull: selectedKeys.length >= MAX_COMPARISON_CARDS,
    changePickerCollection,
    togglePickerCard,
    reorderCards,
  }
}
