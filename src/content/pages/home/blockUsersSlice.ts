import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit'

import { RootState } from '@/app/store'
import {
  LeetCodeApi,
  UserProfilePublicProfile,
  QAQuestion,
  SolutionArticle,
  CommunityArticle,
} from '@/utils'

const api = new LeetCodeApi(location.origin)

export const setBlockUserBySlug = createAsyncThunk<
  UserProfilePublicProfile,
  string,
  { state: RootState }
>('users/setBlockUserBySlug', async slug => {
  const data = await api.getUserInfoBySlug(slug)
  return data
})
export const setBlockUserByPostId = createAsyncThunk<
  QAQuestion,
  string,
  { state: RootState }
>('users/setBlockUserByPostId', async postId => {
  const data = await api.queryQAQuestionByUUID(postId)

  return data
})

export const setBlockUserByCommunityArticleId = createAsyncThunk<
  CommunityArticle,
  string,
  { state: RootState }
>('users/setBlockUserByCommunityArticleId', async id => {
  const data = await api.queryCommunityArticleById(id)

  return data
})

export const setBlockUserBySolutionSlug = createAsyncThunk<
  SolutionArticle,
  string,
  { state: RootState }
>('users/setBlockUserBySolutionSlug', async slug => {
  const data = await api.querySolutionArticleBySlug(slug)

  return data
})

type BlockUser = {
  slug: string
  name: string
  block: boolean
}

export const blockUsersAdapter = createEntityAdapter<BlockUser>({
  selectId: user => user.slug,
})

const initialState = blockUsersAdapter.getInitialState()

const blockUsersSlice = createSlice({
  name: 'blockUsers',
  initialState,
  reducers: {
    unSetBlockUser(state, action: PayloadAction<string>) {
      blockUsersAdapter.removeOne(state, action.payload)
    },
    toggleBlockUser(state, action: PayloadAction<string>) {
      const user = state.entities[action.payload]
      if (user) {
        user.block = !user.block
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(setBlockUserBySlug.fulfilled, (state, action) => {
        if (action.payload) {
          const {
            profile: { userSlug: slug, realName: name },
          } = action.payload
          blockUsersAdapter.upsertOne(state, { slug, name, block: true })
        }
      })
      .addCase(setBlockUserByPostId.fulfilled, (state, action) => {
        if (action.payload) {
          const {
            contentAuthor: { userSlug: slug, realName: name },
          } = action.payload
          blockUsersAdapter.upsertOne(state, { slug, name, block: true })
        }
      })
      .addCase(setBlockUserBySolutionSlug.fulfilled, (state, action) => {
        if (action.payload) {
          const {
            author: {
              profile: { userSlug: slug, realName: name },
            },
          } = action.payload
          blockUsersAdapter.upsertOne(state, { slug, name, block: true })
        }
      })
      .addCase(setBlockUserByCommunityArticleId.fulfilled, (state, action) => {
        if (action.payload) {
          const {
            author: {
              profile: { userSlug: slug, realName: name },
            },
          } = action.payload
          blockUsersAdapter.upsertOne(state, { slug, name, block: true })
        }
      })
  },
})

export const {
  selectAll: selectAllBlockUsers,
  selectById: selecBlockUserById,
  selectIds: selecBlockUserIds,
} = blockUsersAdapter.getSelectors<RootState>(state => state.blockUsers)

export const { unSetBlockUser, toggleBlockUser } = blockUsersSlice.actions

export default blockUsersSlice.reducer
