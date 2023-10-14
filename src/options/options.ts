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
  },
  problemsPage: {
    timer: true,
  },
  contestProblemsPage: {
    disableShortcutkey: false,
    modifyPageLayout: true,
    reverseLayout: false,
    problemViewWidth: '40%',
  },
  contestRankingPage: {
    languageIcon: false,
    showPredict: true,
    realTimePredict: false,
    showOldRating: false,
    ratingPredictor: true,
    showNewRating: true,
    expectingRanking: false,
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
  timer: '计时器',
  disableShortcutkey: '禁用快捷键',
  modifyPageLayout: '修改页面布局',
  reverseLayout: '题面居于右侧',
  languageIcon: '语言图标',
  showOldRating: '显示旧分数',
  ratingPredictor: '显示预测分数',
  showNewRating: '显示新分数',
  showPredict: '显示预测',
  realTimePredict: '显示实时预测',
  expectingRanking: '期望全球排名',
}
