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
  QuestionType,
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
  ProblemsetQuestion[] | null,
  undefined,
  { state: RootState }
>('global/fetchAllQuestions', async (_, { getState, dispatch }) => {
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
    if (total === questions.total) return null
  }

  const res = await api.getProblemsetQuestionListAll({}, total)
  dispatch(fetchAllQuestionIds())
  return res
})

export const fetchAllQuestionIds = createAsyncThunk<
  QuestionType[],
  undefined,
  { state: RootState }
>('global/fetchAllQuestionIds', async () => {
  return api.getAllQuestions()
})

const initialState = questionsAdapter.getInitialState({
  total: 0,
  update: 0,
})

const questionsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAllQuestions.fulfilled, (state, action) => {
        if (action.payload) {
          questionsAdapter.upsertMany(state, action.payload)
          state.total = action.payload.length
          state.update = new Date().valueOf()
        }
      })
      .addCase(fetchAllQuestionIds.fulfilled, (state, action) => {
        for (const q of action.payload) {
          if (state.entities[q.questionFrontendId])
            state.entities[q.questionFrontendId]!.questionId = q.questionId
        }
      })
  },
})

export const {
  selectAll: selectAllQuestions,
  selectById: selectQuestionById,
  selectIds: selectQuestionIds,
} = questionsAdapter.getSelectors<RootState>(state => state.questions)

type Option = {
  categorySlug?: CategorySlugType
  skip?: number
  limit?: number
  filters?: ProblemsetQuestionListFilterType & { custom: CustomFilter }
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
      if (!questions.entities[id]!.questionId)
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

  if (option.categorySlug) {
    const categorySlugs = new Set(['database', 'shell', 'concurrency'])
    for (const id of ids) {
      const question = questions.entities[id]
      if (!question) continue
      if (option.categorySlug === 'algorithms') {
        if (question.topicTags.every(a => !categorySlugs.has(a.slug))) {
          res.push(question)
        }
      } else {
        if (question.topicTags.some(a => a.slug === option.categorySlug)) {
          res.push(question)
        }
      }
    }
  } else {
    res = ids.map(id => questions.entities[id]!)
  }

  if (option.filters) {
    const { difficulty, status, tags, premiumOnly, custom } = option.filters
    const useCustomFilter = custom && (custom.min || custom.max)

    const min = Number(custom?.min ? custom.min : '0'),
      max = Number(custom?.max ? custom.max : Infinity)
    const rankData = state.global.ProblemRankData
    res = res.filter(a => {
      if (difficulty && a.difficulty !== difficulty) return false
      if (status && a.status !== status) return false
      if (premiumOnly && !a.paidOnly) return false
      if (tags) {
        const set = new Set(a.topicTags.map(b => b.slug))
        if (tags.some(tag => !set.has(tag))) return false
      }
      if (useCustomFilter) {
        if (!rankData[a.titleSlug]) return false
        const rating = rankData[a.titleSlug]?.Rating
        if (rating < min || rating > max) return false
      }
      return true
    })

    if (custom.sort) {
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
