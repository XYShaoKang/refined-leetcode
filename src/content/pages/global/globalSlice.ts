import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'
import { LeetCodeApi, GlobalData, ProblemsetPageProps } from '@/utils'

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

export const globalDataSlice = createSlice({
  name: 'global',
  initialState: {} as {
    globalData?: GlobalData
    problemsetPageProps?: ProblemsetPageProps
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchGlobalData.fulfilled, (state, action) => {
        state.globalData = action.payload
      })
      .addCase(fetchProblemsetPageProps.fulfilled, (state, action) => {
        state.problemsetPageProps = action.payload
      })
  },
})

export const selectIsPremium = (state: RootState): boolean | undefined =>
  state.global.globalData?.userStatus?.isPremium
export const selectIsSignedIn = (state: RootState): boolean | undefined =>
  state.global.globalData?.userStatus?.isSignedIn

export const selectFeaturedLists = (
  state: RootState
): ProblemsetPageProps['featuredLists'] | undefined =>
  state.global.problemsetPageProps?.featuredLists

export default globalDataSlice.reducer
