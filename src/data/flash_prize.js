import { createCards } from './heroes.js'

const baseCards = createCards('flash_prize')

const createVariantCard = (rank, assetNumber) => {
  const sourceCard = baseCards.find((card) => card.number === rank)
  return {
    ...sourceCard,
    id: String(assetNumber).padStart(3, '0'),
    edition: '改版',
    images: {
      ...sourceCard.images,
      source: `${import.meta.env.BASE_URL}assets/flash_prize/${assetNumber}.jpg`,
    },
  }
}

export const cards = [
  ...baseCards,
  createVariantCard(92, 109),
  createVariantCard(96, 110),
]
