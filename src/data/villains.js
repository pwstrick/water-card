const villain = (assetNumber, displayId, name, romanizedName, identity, introduction) => ({
  id: String(assetNumber),
  displayId,
  number: assetNumber,
  name,
  romanizedName,
  identity,
  series: '六大恶人',
  kind: 'villain',
  introduction,
})

export const villains = [
  villain(111, '恶01', '童贯', 'TONG GUAN', '枢密使', '统兵征讨梁山却接连败阵，后来参与招安并排挤梁山将领；原著结尾仍在朝中掌权，没有明确写其结局。'),
  villain(113, '恶02', '潘金莲', 'PAN JINLIAN', '武大郎之妻', '与西门庆私通，在王婆撮合下毒杀丈夫武大郎；武松查明真相后将她杀死，为兄报仇。'),
  villain(114, '恶03', '高衙内', 'GAO YANEI', '高俅养子', '倚仗高俅权势横行，因垂涎林冲之妻而设计逼迫林冲；林娘子自尽后，原著未交代他的明确下场。'),
  villain(109, '恶04', '高俅', 'GAO QIU', '殿帅府太尉', '因善踢毬获宋徽宗宠信，掌权后陷害王进、林冲并多次打压梁山；梁山受招安后他仍居高位，原著未写其获罪结局。'),
  villain(110, '恶05', '蔡京', 'CAI JING', '当朝太师', '把持朝政、结党营私，其女婿梁中书为他搜刮生辰纲；征方腊后又参与谋害宋江等人，原著未交代其最终下场。'),
  villain(112, '恶06', '西门庆', 'XIMEN QING', '阳谷县豪绅', '仗财势横行，与潘金莲私通并参与毒害武大郎；最终被返乡查明真相的武松杀死。'),
]

export const createVillainCards = () => villains.map((item) => ({
  ...item,
  images: {
    source: `${import.meta.env.BASE_URL}assets/standard/${item.number}.webp`,
    layout: 'standard',
  },
}))
