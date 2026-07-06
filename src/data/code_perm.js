import { createCards } from './heroes'
import { createVillainCards } from './villains'

// 冷烫卡图均为正面在左、背面在右的合并图。
export const heroCards = createCards('code_perm', 'webp')

export const villainCards = createVillainCards({
  assetDirectory: 'code_perm',
  layout: 'code_perm',
})
