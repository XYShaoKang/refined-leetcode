export const defaultOptions = {
  homePage: {
    block: true,
  },
  problemsetPage: {
    problemList: true,
    problemRating: false,
  },
  problemListPage: {
    problemList: true,
    problemRating: false,
    fixRandomQuestion: true,
  },
  problemsPage: {
    timer: true,
    randomQuestion: true,
    fixBackNav: true,
  },
  contestProblemsPage: {
    disableShortcutkey: false,
  },
  contestRankingPage: {
    languageIcon: true,
    showOldRating: false,
    ratingPredictor: true,
    showNewRating: true,
  },
}

type Child<T extends object> = { [K in keyof T]: T[K] }[keyof T]

export type PageName = keyof typeof defaultOptions | 'solutionsPage'

export type OptionsType = typeof defaultOptions

export type ItemType = Child<OptionsType>

export const labelMap: { [key: string]: string } = {
  homePage: '首页',
  problemsetPage: '题库页',
  problemListPage: '题单页',
  problemsPage: '答题页',
  contestProblemsPage: '竞赛答题页',
  contestRankingPage: '竞赛排名页',
  block: '黑名单',
  problemList: '题单列表',
  problemRating: '题目评分',
  fixRandomQuestion: '修复随机一题按钮',
  timer: '计时器',
  randomQuestion: '随机一题',
  fixBackNav: '修复返回导航',
  disableShortcutkey: '禁用快捷键',
  languageIcon: '语言图标',
  showOldRating: '显示旧分数',
  ratingPredictor: '显示积分',
  showNewRating: '显示新分数',
}
