export const normalizeSearchText = (value) => String(value ?? '')
  .toLowerCase()
  .replace(/\s+/g, '')

export const getRomanizedInitials = (value) => String(value ?? '')
  .split(/\s+/)
  .filter(Boolean)
  .map((word) => word[0])
  .join('')
  .toLowerCase()

export const getCardSearchText = (card) => normalizeSearchText([
  card.id,
  card.displayId,
  card.name,
  card.nickname,
  card.identity,
  card.edition,
  card.star,
  card.series,
  card.romanizedName,
  getRomanizedInitials(card.romanizedName),
].filter(Boolean).join(' '))
