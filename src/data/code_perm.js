import { createCards, heroes } from './heroes'
import { createVillainCards } from './villains'

// 冷烫卡图均为正面在左、背面在右的合并图。
const baseHeroCards = createCards('code_perm', 'webp')
const CODE_PERM_ASSET_DIRECTORY = 'code_perm'

const codePermImage = (number) => ({
  source: `${import.meta.env.BASE_URL}assets/${CODE_PERM_ASSET_DIRECTORY}/${number}.webp`,
  layout: CODE_PERM_ASSET_DIRECTORY,
})

const cardId = (number) => String(number).padStart(3, '0')

const createCodePermCard = ({ number, displayId, images, ...card }) => ({
  ...card,
  id: cardId(number),
  displayId,
  number,
  images: images ?? codePermImage(number),
})

const displayId = (prefix, index) => `${prefix}${String(index + 1).padStart(2, '0')}`

const createNumberedCodePermCards = ({ items, startNumber, displayPrefix, mapItem }) =>
  items.map((item, index) => createCodePermCard({
    ...mapItem(item, index),
    number: startNumber + index,
    displayId: displayId(displayPrefix, index),
  }))

const variantItems = [
  ['雪夜林冲', '林冲'],
  ['马上林冲', '林冲'],
  ['朱仝', '朱仝'],
  ['武松异画', '武松'],
  ['武松打虎', '武松'],
  ['张清', '张清'],
  ['杨志', '杨志'],
  ['徐宁', '徐宁'],
  ['李俊1', '李俊'],
  ['李俊2', '李俊'],
  ['张横', '张横'],
  ['张顺', '张顺'],
  ['燕青', '燕青'],
  ['黄信', '黄信'],
  ['蒋敬', '蒋敬'],
  ['金大坚', '金大坚'],
]

const heroByName = new Map(heroes.map((item) => [item.name, item]))

const getHeroByName = (name) => {
  const hero = heroByName.get(name)
  if (!hero) throw new Error(`Missing base hero for code_perm card: ${name}`)
  return hero
}

const createHeroBasedCard = (baseName, overrides) => ({
  ...getHeroByName(baseName),
  ...overrides,
})

const variantCards = createNumberedCodePermCards({
  items: variantItems,
  startNumber: 115,
  displayPrefix: '异',
  mapItem: ([name, baseName]) => createHeroBasedCard(baseName, { name }),
})

const extraCharacterItems = [
  {
    name: '兀颜光',
    romanizedName: 'WUYAN GUANG',
    nickname: '大辽都统军',
    introduction: '辽国统军大将，精通兵法并摆下太乙混天象阵与梁山军交锋；阵法被破后兵败，最终被关胜斩杀。',
  },
  {
    name: '包道乙',
    romanizedName: 'BAO DAOYI',
    nickname: '灵应天师',
    introduction: '方腊麾下妖道，擅使法术与飞剑，曾在睦州之战中斩断武松左臂；后来被梁山军破法，最终遭凌振火炮击杀。',
  },
  {
    name: '史文恭',
    romanizedName: 'SHI WENGONG',
    nickname: '曾头市教师',
    introduction: '曾头市武艺教师，枪棒高强，夜袭梁山时射中晁盖，是梁山复仇的关键仇敌；最终被卢俊义擒获，剖腹剜心祭奠晁盖。',
  },
  {
    name: '晁盖',
    romanizedName: 'CHAO GAI',
    nickname: '托塔天王',
    edition: '托塔',
    introduction: '东溪村保正，仗义疏财，智取生辰纲后上梁山并成为寨主；攻打曾头市时中史文恭毒箭，最终伤重身亡。',
  },
  {
    name: '方腊',
    romanizedName: 'FANG LA',
    nickname: '圣公',
    introduction: '江南方腊起义首领，自立政权并与宋军、梁山军长期交战；兵败后被鲁智深擒获，最终押赴东京处死。',
  },
  {
    name: '李师师',
    romanizedName: 'LI SHISHI',
    nickname: '东京名妓',
    introduction: '东京名妓，才貌出众，与宋徽宗关系密切，燕青曾借她的门路促成梁山招安；小说未明写其结局，最终下落不明。',
  },
  {
    name: '王庆',
    romanizedName: 'WANG QING',
    nickname: '淮西王',
    introduction: '淮西反王，聚众割据一方，与梁山军多番交战；兵败被擒后押赴京师，最终被朝廷处死。',
  },
  {
    name: '琼英',
    romanizedName: 'QIONG YING',
    nickname: '仇氏女将',
    introduction: '田虎麾下女将，擅使飞石，身负家仇而后与张清相认成婚；随军归宋后育有张节，小说未明写其卒年。',
  },
  {
    name: '田虎',
    romanizedName: 'TIAN HU',
    nickname: '晋王',
    introduction: '河北反王，占据州县自立为晋王，是梁山受招安后征讨的强敌之一；兵败被擒后押赴京师，最终被朝廷处死。',
  },
  {
    name: '郑彪',
    romanizedName: 'ZHENG BIAO',
    nickname: '郑魔君',
    introduction: '方腊麾下法术将领，能施妖法助阵，曾在睦州之战中害死王英、扈三娘；后来法术被破，最终阵亡。',
  },
  {
    name: '郑屠',
    romanizedName: 'ZHENG TU',
    nickname: '镇关西',
    introduction: '渭州恶霸屠户，强占民女并欺压金氏父女，引出鲁达打抱不平；最终被鲁达三拳打死。',
  },
  {
    name: '晁盖',
    romanizedName: 'CHAO GAI',
    nickname: '托塔天王',
    edition: '马上',
    introduction: '东溪村保正，仗义疏财，智取生辰纲后上梁山并成为寨主；攻打曾头市时中史文恭毒箭，最终伤重身亡。',
  },
]

const extraCharacterCards = createNumberedCodePermCards({
  items: extraCharacterItems,
  startNumber: 131,
  displayPrefix: '特',
  mapItem: (item) => ({
    ...item,
    star: '众生',
  }),
})

const giftEditions = [
  '周信用',
  '李云中',
  '陈岱青',
]

const giftCards = createNumberedCodePermCards({
  items: giftEditions,
  startNumber: 143,
  displayPrefix: '赠',
  mapItem: (edition) => createHeroBasedCard('扈三娘', {
    name: '扈三娘',
    edition,
  }),
})

export const heroCards = [...baseHeroCards, ...variantCards, ...extraCharacterCards, ...giftCards]

export const villainCards = createVillainCards({
  assetDirectory: 'code_perm',
  layout: 'code_perm',
})
