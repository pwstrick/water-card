const BADGE_TONE_CLASSES = {
  neutral: 'border-[#73797066] text-[#858b83]',
  gold: 'border-[#c7a76280] bg-[#c7a76214] text-[#d5b66f]',
  silver: 'border-[#9fc3cd80] bg-[#9fc3cd14] text-[#bdd8df]',
  danger: 'border-[#bc675780] bg-[#bc675714] text-[#d77a68]',
}

export function getCardBadgeClass(collection, card) {
  const presentation = collection.presentation ?? {}
  const tone = presentation.kindBadgeTones?.[card.kind]
    ?? presentation.badgeTone
    ?? 'neutral'

  return BADGE_TONE_CLASSES[tone] ?? BADGE_TONE_CLASSES.neutral
}
