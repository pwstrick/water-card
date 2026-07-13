export const getCollectionById = (collections, collectionId) => (
  collections.find((collection) => collection.id === collectionId)
)

export const getCardById = (collection, cardId) => (
  collection?.cards.find((card) => card.id === cardId)
)

// 页面选择器需要始终有可展示内容，因此无效标识统一回退到第一套卡组和第一张卡。
export const resolveCardSelection = (collections, collectionId, cardId) => {
  const collection = getCollectionById(collections, collectionId) ?? collections[0]
  const card = getCardById(collection, cardId) ?? collection?.cards[0]
  return { collection, card }
}

// 对比区解析稳定键时不能回退，否则失效键可能静默指向另一张卡。
export const findCardSelection = (collections, collectionId, cardId) => {
  const collection = getCollectionById(collections, collectionId)
  const card = getCardById(collection, cardId)
  return { collection, card }
}

export const findCharacterCards = (collections, characterName) => (
  // 同人物版本按卡组原顺序返回，对比区可在此基础上提升当前基准卡组。
  collections.flatMap((collection) => {
    const card = collection.cards.find((item) => item.name === characterName)
    return card ? [{ collection, card }] : []
  })
)
