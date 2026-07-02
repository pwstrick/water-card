import { createCards } from './heroes.js'

export const cards = createCards('standard')
export const defaultCard = cards.find((card) => card.id === '034') ?? cards[0]
