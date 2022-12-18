import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit'

import { RootState } from '@/app/store'
import { LeetCodeApi, NotyArticleType, NotyItem } from '@/utils'

const api = new LeetCodeApi(location.origin)

type Post = {
  feedContent: {
    uuid: string
    author: { userSlug: string }
  }
  meta: { link: string }
}

const postsAdapter = createEntityAdapter<Post>({
  selectId: post => post.feedContent.uuid,
})

export const fetchPosts = createAsyncThunk<
  NotyItem,
  number,
  { state: RootState }
>('posts/fetchPosts', async (limit, { getState }) => {
  const nextToken = getState().posts.nextToken
  const res = await api.getNoty(nextToken, limit)
  return res
})

const initialState = postsAdapter.getInitialState({
  nextToken: '',
})

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.nextToken = action.payload.nextToken

      const data = action.payload.rows.filter(
        a => a.feedContent.__typename === 'Article'
      ) as { feedContent: NotyArticleType; meta: { link: string } }[]

      postsAdapter.upsertMany(state, data)
    })
  },
})

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors<RootState>(state => state.posts)

export default postsSlice.reducer
