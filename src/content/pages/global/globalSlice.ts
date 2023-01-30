import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import store, { RootState } from '@/app/store'
import {
  LeetCodeApi,
  GlobalData,
  ProblemsetPageProps,
  ProblemRankData,
  getProblemRankData,
  getPageName,
} from '@/utils'
import { PageName } from 'src/options/options'
import { debounce } from 'src/utils'

const api = new LeetCodeApi(location.origin)

export const fetchGlobalData = createAsyncThunk<
  GlobalData,
  undefined,
  { state: RootState }
>('global/fetchGlobalData', async () => {
  const res = await api.queryGlobalData()
  return res
})

export const fetchProblemsetPageProps = createAsyncThunk<
  ProblemsetPageProps,
  undefined,
  { state: RootState }
>('global/fetchProblemsetPageProps', async () => {
  const res = await api.getProblemsetPageProps()
  return res
})

export const fetchProblemRankData = createAsyncThunk<
  ProblemRankData[],
  undefined,
  { state: RootState }
>('global/fetchProblemRankData', async () => {
  const res = await getProblemRankData()
  return res
})

const initialState: {
  globalData?: GlobalData
  problemsetPageProps?: ProblemsetPageProps
  ProblemRankData: { [key: string]: ProblemRankData }
  currentPage?: PageName
} = { ProblemRankData: {}, currentPage: getPageName() }

export const globalDataSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchGlobalData.fulfilled, (state, action) => {
        state.globalData = action.payload
      })
      .addCase(fetchProblemsetPageProps.fulfilled, (state, action) => {
        state.problemsetPageProps = action.payload
      })
      .addCase(fetchProblemRankData.fulfilled, (state, action) => {
        for (const rank of action.payload) {
          state.ProblemRankData[rank.TitleSlug] = rank
        }
      })
  },
})
let cancelHandle: (() => void) | null
window.addEventListener('urlchange', () => {
  cancelHandle?.()
  // 前端路由跳转时，url 变化时，页面本身还没有完成跳转
  // 则有可能会获取到旧页面的元素
  // 通过检测是否还有元素变化，判断当前是否跳转完成

  const handleUrlChange = debounce(() => {
    cancelHandle?.()
    store.dispatch(globalDataSlice.actions.setCurrentPage(getPageName()))
  }, 1000)
  const obs = new MutationObserver(handleUrlChange)
  obs.observe(document.body, { childList: true, subtree: true })

  cancelHandle = () => {
    cancelHandle = null
    handleUrlChange.destroy()
    obs.disconnect()
  }
})

export const selectIsPremium = (state: RootState): boolean | undefined =>
  state.global.globalData?.userStatus?.isPremium
export const selectIsSignedIn = (state: RootState): boolean | undefined =>
  state.global.globalData?.userStatus?.isSignedIn

export const selectFeaturedLists = (
  state: RootState
): ProblemsetPageProps['featuredLists'] | undefined =>
  state.global.problemsetPageProps?.featuredLists

export const selectProblemRankDataByTitleSlug = (
  state: RootState,
  titleSlug: string
): ProblemRankData | undefined => state.global.ProblemRankData[titleSlug]

export const selectCurrentPage = (state: RootState): PageName | undefined =>
  state.global.currentPage

export default globalDataSlice.reducer
