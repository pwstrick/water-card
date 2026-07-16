import { createCards, heroes } from './heroes'
import { villains } from './villains'
import { createNamedLookup, createNumberedCardHelpers } from './cardFactory'

const CHARACTER_ART_ASSET_DIRECTORY = 'character_art'
// 立绘资源的 86、87 号图片与人物排名成对倒置，排名字段仍保持原始顺序。
const CHARACTER_ART_ASSET_NUMBER_OVERRIDES = {
  周通: 87,
  李忠: 86,
}

const baseHeroCards = createCards(CHARACTER_ART_ASSET_DIRECTORY, 'webp')
  .map((card) => {
    const assetNumber = CHARACTER_ART_ASSET_NUMBER_OVERRIDES[card.name] ?? card.number
    return {
      ...card,
      images: {
        ...card.images,
        source: `${import.meta.env.BASE_URL}assets/${CHARACTER_ART_ASSET_DIRECTORY}/${assetNumber}.webp`,
      },
    }
  })

const {
  createNumberedCards: createNumberedCharacterArtCards,
} = createNumberedCardHelpers({
  assetDirectory: CHARACTER_ART_ASSET_DIRECTORY,
})

const getHeroByName = createNamedLookup(
  heroes,
  (name) => `Missing base hero for character_art card: ${name}`,
)
const getVillainByName = createNamedLookup(
  villains,
  (name) => `Missing base villain for character_art card: ${name}`,
)

const createHeroBasedCard = (baseName, overrides) => ({
  ...getHeroByName(baseName),
  ...overrides,
})

const villainItems = [
  '西门庆',
  '潘金莲',
  '高衙内',
]

export const villainCards = createNumberedCharacterArtCards({
  items: villainItems,
  startNumber: 112,
  displayPrefix: '恶',
  mapItem: (name) => getVillainByName(name),
})

const extraCharacterItems = [
  createHeroBasedCard('朱富', { name: '朱富', edition: '错版' }),
  {
    name: '琼英',
    romanizedName: 'QIONG YING',
    nickname: '仇氏女将',
    introduction: '田虎麾下女将，擅使飞石，身负家仇而后与张清相认成婚；随军归宋后育有张节，小说未明写其卒年。',
  },
  {
    name: '阎婆惜',
    romanizedName: 'YAN POXI',
    nickname: '外室',
    introduction: '郓城县女子，受宋江接济后成为其外室，后来发现梁山书信并要挟宋江；争执中被宋江杀死。',
  },
  {
    name: '李师师',
    romanizedName: 'LI SHISHI',
    nickname: '东京名妓',
    introduction: '东京名妓，才貌出众，与宋徽宗关系密切，燕青曾借她的门路促成梁山招安；小说未明写其结局，最终下落不明。',
  },
]

export const extraCharacterCards = createNumberedCharacterArtCards({
  items: extraCharacterItems,
  startNumber: 115,
  displayPrefix: '特',
  mapItem: (item) => ({
    ...item,
    star: '特卡',
  }),
})

export const heroCards = baseHeroCards

export const cards = [...heroCards, ...villainCards, ...extraCharacterCards]
