import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react'

import {
  calcSeed,
  ContestInfo,
  ContestRanking,
  getExtensionId,
  getPreviousRatingData,
  gkey,
  LeetCodeApi,
  MyRanking,
  predict,
  PreviousRatingDataType,
  RankingDataType,
  Rating,
  SubmissionType,
} from '@/utils'
import {
  createAsyncThunk,
  createSlice,
  current,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '@/app/store'
import { findRank } from './utils'

export type ParamType = {
  contestSlug: string
  users: { username: string; region: string }[]
}

type GetPredictionMessage =
  | {
      type: 'get-prediction'
      contestSlug: string
      users: { username: string; region: string }[]
    }
  | {
      type: 'get-file-icons'
    }
  | {
      type: 'get-user-ranking'
      username: string
    }

type ArgsType = { message: GetPredictionMessage }

const extensionId = getExtensionId()!
const customBaseQuery = (): BaseQueryFn<ArgsType, unknown, unknown> => {
  return async ({ message }) => {
    return new Promise(function (resolve) {
      chrome.runtime.sendMessage(extensionId, message, function (response) {
        resolve({ data: response })
      })
    })
  }
}
const query = async <T>({ message }: { message: GetPredictionMessage }) => {
  return new Promise<T>(function (resolve) {
    chrome.runtime.sendMessage(extensionId, message, function (response) {
      resolve(response)
    })
  })
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery(),
  endpoints: builder => ({
    getPrediction: builder.query<any, ParamType>({
      query: params => ({
        message: {
          type: 'get-prediction',
          ...params,
        },
      }),
    }),
    getFileIcons: builder.query<any, void>({
      query: () => ({
        message: {
          type: 'get-file-icons',
        },
      }),
    }),
  }),
})

export const { useGetPredictionQuery, useGetFileIconsQuery } = apiSlice

const api = new LeetCodeApi(location.origin)

/** 获取比赛信息
 *
 */
export const fetchContestInfo = createAsyncThunk<
  ContestInfo,
  string,
  { state: RootState }
>('contestInfos/fetchContestInfo', async contestSlug => {
  const res = await api.getContestInfo(contestSlug)
  return res
})

/** 获取比赛对应页的用户答题和 Rank 等信息
 *
 */
export const fetchContestRanking = createAsyncThunk<
  RankingDataType,
  { contestSlug: string; page: number; region: 'local' | 'global' },
  { state: RootState }
>('contestInfos/fetchContestRanking', async ({ contestSlug, page, region }) => {
  const res = await api.getContest(contestSlug, page, region)
  return res
})

/** 获取预测数据源获取预测数据
 *
 */
export const fetchPrediction = createAsyncThunk<
  {
    data_region: string
    username: string
    delta?: number
    oldRating?: number
  }[],
  { contestSlug: string; users: { region: string; username: string }[] },
  { state: RootState }
>('contestInfos/fetchPrediction', async ({ contestSlug, users }) => {
  const res = await query<
    {
      data_region: string
      username: string
      delta?: number
    }[]
  >({
    message: { type: 'get-prediction', contestSlug, users },
  })
  return res
})

/** 获取实时预测需要的数据
 *
 */
export const fetchPreviousRatingData = createAsyncThunk<
  PreviousRatingDataType,
  { contestSlug: string },
  { state: RootState }
>('contestInfos/fetchPreviousRatingData', async ({ contestSlug }) => {
  const res = await getPreviousRatingData(contestSlug)
  return res
})

/** 获取自己的 Rank 数据
 *
 */
export const fetchMyRank = createAsyncThunk<
  MyRanking,
  string,
  { state: RootState }
>('contestInfos/fetchMyRank', async contestSlug => {
  const res = await api.getGlobalyRanking(contestSlug)
  return res
})

/** 获取用户的 Rating 数据
 *
 * 主要是当 PreviousRatingData 不包含某个用户的信息时，则需要实时去 LeetCode 获取数据，用于实时预测
 *
 */
export const fetchUserRating = createAsyncThunk<
  RealPredict,
  { region: string; username: string; contestSlug: string },
  { state: RootState }
>(
  'contestInfos/fetchUserRating',
  async ({ region, username, contestSlug }, { getState }) => {
    let res: Rating
    if (region.toLocaleLowerCase() === 'cn') {
      res = await api.getRating(username, true)
    } else {
      res = await query({ message: { type: 'get-user-ranking', username } })
    }
    const { start_time } = getState().contestInfos[contestSlug].info!.contest
    const history = res.userContestRankingHistory.filter(a => a.attended)

    let l = 0,
      r = history.length - 1
    while (l < r) {
      const m = (l + r + 1) >> 1
      if (history[m].contest.startTime < start_time) {
        l = m
      } else {
        r = m - 1
      }
    }

    return { oldRating: history[l].rating ?? 1500, acc: l + 1 }
  }
)

type User = {
  username: string
  rank?: number
  finishTime: number
  score: number
  region: string
  submission: { [key: number]: SubmissionType }
}

type RealPredict = {
  oldRating?: number
  delta?: number
  acc?: number
  rank?: number
  preCache?: number // 用以保存上次计算时的缓存，避免重复计算，由 rank*1e4+oldRating 计算而成
}

export type Status = 'idle' | 'loading' | 'succeeded' | 'failed'
type State = {
  [contestSlug: string]: {
    info?: ContestInfo
    myRanking?: MyRanking
    // ranking: Ranking
    previous: {
      RatingData?: PreviousRatingDataType
      seeds?: number[]
      status: Status
    }
    users: { [key: string]: User }
    predict: {
      [key: string]: {
        oldRating?: number
        delta?: number
      }
    }
    realPredict: { [key: string]: RealPredict }
    fetchContestRankingState: Status
  }
} & { myRating?: ContestRanking }

const initialState: State = {}
const setDefaultState = (state: State, contestSlug: string) => {
  if (!state[contestSlug]) {
    state[contestSlug] = {
      users: {},
      predict: {},
      realPredict: {},
      previous: { status: 'idle' },
      fetchContestRankingState: 'idle',
    }
  }
}
export const contestInfosSlice = createSlice({
  name: 'contestInfos',
  initialState,
  reducers: {
    setUserRating(
      state,
      action: PayloadAction<{
        contestSlug: string
        key: string
        rating?: number
        acc?: number
        rank?: number
      }>
    ) {
      const { contestSlug, key, rating, acc, rank } = action.payload
      setDefaultState(state, contestSlug)
      state[contestSlug].realPredict[key] = Object.assign(
        state[contestSlug].realPredict[key] ?? {},
        { oldRating: rating, acc, rank }
      )
    },
    setUserDelta(
      state,
      action: PayloadAction<{
        contestSlug: string
        key: string
        delta?: number
        preCache?: number
      }>
    ) {
      const { contestSlug, key, delta, preCache } = action.payload
      setDefaultState(state, contestSlug)
      state[contestSlug].realPredict[key].delta = delta
      state[contestSlug].realPredict[key].preCache = preCache
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchContestInfo.fulfilled, (state, action) => {
        setDefaultState(state, action.meta.arg)
        state[action.meta.arg].info = action.payload
      })
      .addCase(fetchPreviousRatingData.rejected, (state, action) => {
        const { contestSlug } = action.meta.arg
        setDefaultState(state, contestSlug)
        state[contestSlug].previous.status = 'failed'
      })
      .addCase(fetchPreviousRatingData.pending, (state, action) => {
        const { contestSlug } = action.meta.arg
        setDefaultState(state, contestSlug)
        state[contestSlug].previous.status = 'loading'
      })
      .addCase(fetchPreviousRatingData.fulfilled, (state, action) => {
        const { totalRank } = action.payload
        totalRank.sort((a, b) => {
          if (a.score !== b.score) return b.score - a.score
          return a.finish_time - b.finish_time
        })
        const { contestSlug } = action.meta.arg
        setDefaultState(state, contestSlug)
        const { previous, realPredict, users } = state[contestSlug]
        const cur = JSON.stringify(current(previous).RatingData ?? {})
        if (cur === JSON.stringify(action.payload)) {
          previous.status = 'succeeded'
          return
        }
        const ratingData = (previous.RatingData = action.payload)

        for (const rank of totalRank) {
          const key = gkey(rank.data_region, rank.username)
          realPredict[key] = {
            oldRating: rank.rating,
            acc: rank.acc,
          }
        }

        const ratings = totalRank.filter(a => a.score).map(a => a.rating)
        const seeds = calcSeed(ratings)

        for (const { region, username, score, finishTime } of Object.values(
          users
        )) {
          const key = gkey(region, username)
          if (!realPredict[key]) continue
          const { oldRating, acc } = realPredict[key]
          const rank = findRank(ratingData!, score, finishTime)
          const delta = predict(seeds, oldRating!, rank, acc ?? 0)
          const preCache = rank * 1e4 + oldRating!
          Object.assign(realPredict[key], { rank, preCache, delta })
        }

        previous.seeds = seeds
        previous.status = 'succeeded'
      })
      .addCase(fetchMyRank.fulfilled, (state, action) => {
        const contestSlug = action.meta.arg
        setDefaultState(state, contestSlug)
        state[contestSlug].myRanking = action.payload
        const {
          my_rank: {
            username,
            finish_time: finishTime,
            score,
            data_region: region,
          },
          my_submission,
        } = action.payload
        const key = gkey(region, username)
        state[contestSlug].users[key] = {
          username,
          finishTime,
          score,
          region,
          submission: my_submission,
        }
      })
      .addCase(fetchUserRating.fulfilled, (state, action) => {
        const { contestSlug, region, username } = action.meta.arg
        state[contestSlug].realPredict[gkey(region, username)] = action.payload
      })
      .addCase(fetchContestRanking.rejected, (state, action) => {
        const { contestSlug } = action.meta.arg
        setDefaultState(state, contestSlug)
        state[contestSlug].fetchContestRankingState = 'failed'
      })
      .addCase(fetchContestRanking.pending, (state, action) => {
        const { contestSlug } = action.meta.arg
        setDefaultState(state, contestSlug)
        state[contestSlug].fetchContestRankingState = 'loading'
      })
      .addCase(fetchContestRanking.fulfilled, (state, action) => {
        const { contestSlug } = action.meta.arg
        setDefaultState(state, contestSlug)
        const { submissions, total_rank } = action.payload
        const n = total_rank.length
        const {
          realPredict,
          users,
          previous: { RatingData, seeds },
        } = state[contestSlug]
        for (let i = 0; i < n; i++) {
          const {
            username,
            finish_time: finishTime,
            score,
            data_region: region,
          } = total_rank[i]
          const key = gkey(region, username)
          const user = users[key]
          if (!user || user.score !== score || user.finishTime !== finishTime) {
            state[contestSlug].users[key] = {
              username,
              finishTime,
              score,
              region,
              submission: submissions[i],
            }
          }
          const { oldRating, acc, preCache } = realPredict[key] ?? {}
          if (RatingData && seeds && oldRating !== undefined) {
            const rank = findRank(RatingData, score, finishTime)
            const cache = rank * 1e4 + oldRating!
            if (cache !== preCache) {
              const delta = predict(seeds, oldRating, rank, acc ?? 0)
              realPredict[key].delta = delta
              realPredict[key].preCache = cache
            }
          }
        }
        state[contestSlug].fetchContestRankingState = 'succeeded'
      })
      .addCase(fetchPrediction.fulfilled, (state, action) => {
        const { contestSlug } = action.meta.arg
        setDefaultState(state, contestSlug)
        if (!action.payload) return
        for (const {
          username,
          data_region,
          oldRating,
          delta,
        } of action.payload) {
          const key = gkey(data_region, username)
          state[contestSlug].predict[key] = {
            oldRating,
            delta,
          }
        }
      })
  },
})

export const selectContestInfo = (
  state: RootState,
  contestSlug: string
): ContestInfo | undefined => state.contestInfos[contestSlug]?.info
export const selectPreviousRatingData = (
  state: RootState,
  contestSlug: string
): PreviousRatingDataType | undefined =>
  state.contestInfos[contestSlug]?.previous.RatingData
export const selectPreviousSeeds = (
  state: RootState,
  contestSlug: string
): number[] | undefined => state.contestInfos[contestSlug]?.previous.seeds

export const selectMyRanking = (
  state: RootState,
  contestSlug: string
): MyRanking | undefined => state.contestInfos[contestSlug]?.myRanking
export const selectMyRating = (
  state: RootState,
  userSlug?: string
): ContestRanking | undefined =>
  userSlug ? state.contestInfos.myRating : undefined

export const selectPreviousRatingDataStatus = (
  state: RootState,
  contestSlug?: string
): Status | undefined =>
  contestSlug ? state.contestInfos[contestSlug].previous.status : undefined
export const selectFetchContestRankingState = (
  state: RootState,
  contestSlug?: string
): Status | undefined =>
  contestSlug
    ? state.contestInfos[contestSlug].fetchContestRankingState
    : undefined

export const selectUserRanking = (
  state: RootState,
  contestSlug: string,
  region: string,
  username: string
): User | undefined =>
  contestSlug && region && username
    ? state.contestInfos[contestSlug]?.users[gkey(region, username)]
    : undefined

export const selectUserPredict = (
  state: RootState,
  contestSlug: string,
  region: string,
  username: string,
  realPredict: boolean
): RealPredict | undefined =>
  contestSlug && region && username
    ? state.contestInfos[contestSlug]?.[
        realPredict ? 'realPredict' : 'predict'
      ][gkey(region, username)]
    : undefined

export const { setUserRating, setUserDelta } = contestInfosSlice.actions
