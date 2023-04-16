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
  },
  contestProblemsPage: {
    disableShortcutkey: false,
  },
  contestRankingPage: {
    languageIcon: false,
    showPredict: true,
    realTimePredict: false,
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
  disableShortcutkey: '禁用快捷键',
  languageIcon: '语言图标',
  showOldRating: '显示旧分数',
  ratingPredictor: '显示预测分数',
  showNewRating: '显示新分数',
  showPredict: '显示预测',
  realTimePredict: '显示实时预测',
}
