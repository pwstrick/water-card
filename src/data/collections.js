import { cards as standardCards } from './standard'
import { cards as flashPrizeCards } from './flash_prize'

// 鉴赏区的首次进入状态；切换卡组时会继续由当前组件状态接管。
export const DEFAULT_COLLECTION_ID = 'standard'
export const DEFAULT_CARD_ID = '001'
// 控制对比区的选择上限，兼顾桌面端排版和移动端同时解码图片的内存开销。
export const MAX_COMPARISON_CARDS = 6

// 默认同时展示普卡和奖闪的解珍，便于进入对比区后立即看到版本差异。
export const DEFAULT_COMPARISON_CARDS = [
  { collectionId: 'standard', cardId: '034' },
  { collectionId: 'flash_prize', cardId: '034' },
]

export const collections = [
  { id: 'standard', label: '普卡', cards: standardCards },
  { id: 'flash_prize', label: '奖闪', cards: flashPrizeCards },
]
