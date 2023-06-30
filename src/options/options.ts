export const defaultOptions = {
  problemsetPage: {
    problemRating: false,
  },
}

type Child<T extends object> = { [K in keyof T]: T[K] }[keyof T]

export type PageName = keyof typeof defaultOptions | 'solutionsPage'

export type OptionsType = typeof defaultOptions

export type ItemType = Child<OptionsType>

export const labelMap: { [key: string]: string } = {
  homePage: 'Home Page',
  problemsetPage: 'Problem Set Page',
  problemListPage: 'Problem List Page',
  problemsPage: 'Problems Page',
  contestProblemsPage: 'Contest Problems Page',
  contestRankingPage: 'Contest Ranking Page',
  block: 'Block',
  problemList: 'Problem List',
  problemRating: 'Problem Rating',
  fixRandomQuestion: 'Fix Random Question',
  timer: 'Timer',
  randomQuestion: 'Random Question',
  disableShortcutkey: 'Disable Shortcutkey',
  languageIcon: 'Language Icon',
  showOldRating: 'Show Old Rating',
  ratingPredictor: 'Rating Predictor',
  showNewRating: 'Show New Rating',
  showPredict: 'Show Predict',
  realTimePredict: 'Real Time Predict',
  expectingRanking: 'Expecting Ranking',
}
