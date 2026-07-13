export const cardId = (number) => String(number).padStart(3, '0')

export const prefixedDisplayId = (prefix, index) => `${prefix}${String(index + 1).padStart(2, '0')}`

// 图片路径和裁切布局在数据生成阶段确定，渲染层无需理解不同卡组的目录规则。
export const createCardImage = ({
  assetDirectory,
  imageExtension = 'webp',
  layout = assetDirectory,
  number,
}) => ({
  source: `${import.meta.env.BASE_URL}assets/${assetDirectory}/${number}.${imageExtension}`,
  layout,
})

export const createNamedLookup = (items, missingMessage) => {
  // 构建期先索引人物资料，后续批量生成卡片时避免反复线性扫描。
  const byName = new Map(items.map((item) => [item.name, item]))

  return (name) => {
    const item = byName.get(name)
    if (!item) throw new Error(missingMessage(name))
    return item
  }
}

export const createNumberedCardHelpers = ({
  assetDirectory,
  imageExtension = 'webp',
  layout = assetDirectory,
}) => {
  // 每个卡组绑定自己的目录和布局，返回的局部工厂只关心编号及人物字段。
  const image = (number) => createCardImage({
    assetDirectory,
    imageExtension,
    layout,
    number,
  })

  const createCard = ({ number, displayId = cardId(number), images, ...card }) => ({
    ...card,
    id: cardId(number),
    displayId,
    number,
    images: images ?? image(number),
  })

  const createNumberedCards = ({ items, startNumber, displayPrefix, mapItem }) =>
    items.map((item, index) => createCard({
      ...mapItem(item, index),
      number: startNumber + index,
      displayId: prefixedDisplayId(displayPrefix, index),
    }))

  return {
    createCard,
    createNumberedCards,
    image,
  }
}
