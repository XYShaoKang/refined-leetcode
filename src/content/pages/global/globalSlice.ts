import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'
import { LeetCodeApi, GlobalData } from '@/utils'

const api = new LeetCodeApi(location.origin)

export const fetchGlobalData = createAsyncThunk<
  GlobalData,
  undefined,
  { state: RootState }
>('global/fetchGlobalData', async () => {
  const res = await api.queryGlobalData()
  return res
})

export const globalDataSlice = createSlice({
  name: 'global',
  initialState: {} as GlobalData,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchGlobalData.fulfilled, (state, action) => {
      state.commonNojPermissionTypes = action.payload.commonNojPermissionTypes
      state.jobsMyCompany = action.payload.jobsMyCompany
      state.userStatus = action.payload.userStatus
    })
  },
})

export const selectIsPremium = (state: RootState): boolean | undefined =>
  state.globalData?.userStatus?.isPremium
export const selectIsSignedIn = (state: RootState): boolean | undefined =>
  state.globalData?.userStatus?.isSignedIn

export default globalDataSlice.reducer
