import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  EntityId,
} from '@reduxjs/toolkit'
import { differenceInHours } from 'date-fns/fp'

import { RootState } from '@/app/store'
import {
  CategorySlugType,
  LeetCodeApi,
  ProblemsetQuestion,
  ProblemsetQuestionList,
  ProblemsetQuestionListFilterType,
  QuestionStatus,
  QuestionType,
  userProfileQuestion,
} from '@/utils'

import { selectFavoriteById } from '../problem-list/favoriteSlice'
import { CustomFilter } from './utils'

const api = new LeetCodeApi(location.origin)

const questionsAdapter = createEntityAdapter<
  ProblemsetQuestion & { questionId?: string }
>({
  selectId: question => question.frontendQuestionId,
})

export const fetchAllQuestions = createAsyncThunk<
  Map<CategorySlugType, ProblemsetQuestion[]> | null,
  undefined,
  { state: RootState }
>('questions/fetchAllQuestions', async (_, { getState, dispatch }) => {
  const questions = getState().questions
  const date = new Date(questions.update)
  const dif = differenceInHours(date)(new Date())
  let total: number | undefined = undefined

  if (dif < 24) {
    total = (await api.getProblemsetQuestionList({ skip: 0, limit: 1 })).total
    // 如果上次更新时间不超过一天，并且题目总数没有变化时，则不用去更新全部内容，
    // 只需要更新一些最新的变化既可以，比如在上次更新时间之后的成功提交，会造成 status 的变化
    // 另外如果原本没有会员，新开了会员之后，是可以获取到 freqBar [出现频率] 这个信息的，
    // 这时候就需要重新去获取一下。
    if (total === questions.total) {
      // 更新最近提交的题目状态
      await dispatch(fetchLastACQuestions({ last: date, status: 'ACCEPTED' }))
      await dispatch(fetchLastACQuestions({ last: date, status: 'FAILED' }))
      return null
    }
  }

  return api.getAllQuestion()
})

export const fetchLastACQuestions = createAsyncThunk<
  userProfileQuestion[],
  { last: Date; status: QuestionStatus },
  { state: RootState }
>('questions/fetchLastACQuestions', async ({ last, status }) =>
  api.queryACQuestions(last, status)
)

export const fetchAllQuestionIds = createAsyncThunk<
  QuestionType[],
  undefined,
  { state: RootState }
>('questions/fetchAllQuestionIds', async () => api.getAllQuestions())

const initData = {
  total: 0,
  update: 0,
} as {
  total: number
  update: number
} & { [key in CategorySlugType]: string[] }

const initialState = questionsAdapter.getInitialState(initData)

const questionsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAllQuestions.fulfilled, (state, action) => {
        const map = action.payload
        if (map) {
          const allQuestions = map.get('all-code-essentials')!
          questionsAdapter.upsertMany(state, allQuestions)
          state.total = allQuestions.length
          state.update = new Date().valueOf()
          for (const [category, questions] of map) {
            if (category === 'all-code-essentials') continue
            state[category] = questions.map(q => q.frontendQuestionId)
          }
        }
      })
      .addCase(fetchAllQuestionIds.fulfilled, (state, action) => {
        for (const q of action.payload) {
          const question = state.entities[q.questionFrontendId]
          question && (question.questionId = q.questionId)
        }
      })
      .addCase(fetchLastACQuestions.fulfilled, (state, action) => {
        for (const q of action.payload) {
          const question = state.entities[q.frontendId]
          if (!question) continue
          if (action.meta.arg.status === 'ACCEPTED') {
            question.status = 'AC'
          } else if (action.meta.arg.status === 'FAILED') {
            question.status = 'TRIED'
          }
        }
      })
  },
})

export const {
  selectAll: selectAllQuestions,
  selectById: selectQuestionById,
  selectIds: selectQuestionIds,
} = questionsAdapter.getSelectors<RootState>(state => state.questions)

export type Option = {
  categorySlug?: CategorySlugType
  skip?: number
  limit?: number
  filters?: ProblemsetQuestionListFilterType & { custom?: CustomFilter }
}
export const selectQuestonsByOption = (
  state: RootState,
  option: Option
): { data: { problemsetQuestionList: ProblemsetQuestionList } } => {
  let res: ProblemsetQuestion[] = []
  const { questions } = state
  let ids = questions.ids
  if (option?.filters?.listId) {
    const map = new Map<string, ProblemsetQuestion>()
    for (const id of questions.ids) {
      // allQuestions 这个 API 无法获取最新的一个会员题，遇到这种情况直接跳过
      if (!questions.entities[id]!.questionId) continue

      map.set(questions.entities[id]!.questionId!, questions.entities[id]!)
    }
    const list = selectFavoriteById(state, option.filters!.listId!)
    if (!list)
      return {
        data: {
          problemsetQuestionList: {
            __typename: 'QuestionListNode',
            questions: [],
            hasMore: false,
            total: 0,
          },
        },
      }

    ids =
      (list.questionIds
        ?.map((id: number) => map.get(id.toString())?.frontendQuestionId)
        .filter(Boolean) as EntityId[]) ?? []
  }

  if (option.categorySlug && option.categorySlug !== 'all-code-essentials') {
    const set = new Set(questions[option.categorySlug])
    for (const id of ids) {
      const question = questions.entities[id]
      if (!question || !set.has(question.frontendQuestionId)) continue
      res.push(question)
    }
  } else {
    res = ids.map(id => questions.entities[id]!)
  }

  if (option.filters) {
    const { difficulty, status, tags, premiumOnly, custom } = option.filters
    const ratingFilter = custom && (custom.min || custom.max)

    const min = Number(custom?.min ? custom.min : 0),
      max = Number(custom?.max ? custom.max : Infinity)
    const rankData = state.global.ProblemRankData
    res = res.filter(a => {
      // 难度
      if (difficulty && a.difficulty !== difficulty) return false
      // 状态
      if (status && a.status !== status) return false
      // 只包含会员题
      if (premiumOnly && !a.paidOnly) return false
      // 不包含会员题
      if (custom?.includePremium === false && a.paidOnly) return false
      // 标签
      if (tags) {
        const set = new Set(a.topicTags.map(b => b.slug))
        if (tags.some(tag => !set.has(tag))) return false
      }
      // 题目评分
      if (ratingFilter) {
        if (!rankData[a.titleSlug]) return false
        const rating = rankData[a.titleSlug]?.Rating
        if (rating < min || rating > max) return false
      }
      return true
    })

    if (custom && custom.sort) {
      const { sortOrder, orderBy } = custom.sort
      const defalutValue = sortOrder === 'DESCENDING' ? 0 : Infinity
      const getValue = (q: ProblemsetQuestion): number => {
        switch (orderBy) {
          case 'SOLUTION_NUM':
            return q.solutionNum
          case 'AC_RATE':
            return q.acRate
          case 'DIFFICULTY':
            return q.difficulty === 'EASY'
              ? 0
              : q.difficulty === 'MEDIUM'
              ? 1
              : 2
          case 'FREQUENCY':
            return q.freqBar
          case 'RANKING':
            return rankData[q.titleSlug]?.Rating ?? defalutValue
        }
        return 0
      }
      const compareId = (a: ProblemsetQuestion, b: ProblemsetQuestion) => {
        const x = Number(a.frontendQuestionId),
          y = Number(b.frontendQuestionId)
        if (isNaN(x)) {
          if (isNaN(y)) {
            return a.frontendQuestionId > b.frontendQuestionId ? 1 : -1
          }
          return 1
        } else {
          if (isNaN(y)) {
            return -1
          }
          return x - y
        }
      }
      if (sortOrder === 'DESCENDING') {
        res.sort((a, b) => {
          if (orderBy === 'FRONTEND_ID') return compareId(b, a)

          const x = getValue(a),
            y = getValue(b)
          if (x === y) {
            return compareId(a, b)
          }
          return y - x
        })
      } else {
        res.sort((a, b) => {
          if (orderBy === 'FRONTEND_ID') return compareId(a, b)

          const x = getValue(a),
            y = getValue(b)
          if (x === y) {
            return compareId(a, b)
          }
          return x - y
        })
      }
    }
  }
  const start = option.skip ?? 0,
    end = start + (option.limit ?? 50)
  return {
    data: {
      problemsetQuestionList: {
        __typename: 'QuestionListNode',
        questions: res.slice(start, end),
        hasMore: end < res.length,
        total: res.length,
      },
    },
  }
}

export default questionsSlice.reducer
