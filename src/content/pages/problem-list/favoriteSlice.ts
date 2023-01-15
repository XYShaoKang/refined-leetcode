import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit'

import { RootState } from '@/app/store'
import {
  LeetCodeApi,
  Favorite,
  FavoriteDetail,
  AddFavoriteResult,
} from '@/utils'

const api = new LeetCodeApi(location.origin)

type FavoriteType = Favorite &
  Partial<Omit<FavoriteDetail, keyof Favorite>> & {
    showName?: string
    isInAudit?: boolean
  }

const favoritesAdapter = createEntityAdapter<FavoriteType>({
  selectId: favorite => favorite.idHash,
})

export const fetchFavorites = createAsyncThunk<
  {
    allFavorites: Favorite[]
    officialFavorites: Favorite[]
  },
  undefined,
  { state: RootState }
>('favorites/fetchFavorites', async () => {
  const res = await api.getFavorites()
  return res
})

export const fetchFavoriteMyFavorites = createAsyncThunk<
  FavoriteDetail[],
  undefined,
  { state: RootState }
>('favorites/fetchFavoriteMyFavorites', () => api.getFavoriteMyFavorites())

export const fetchFavoriteDetails = createAsyncThunk<
  FavoriteDetail[],
  string[],
  { state: RootState }
>('favorites/fetchFavoriteDetails', favoriteIds =>
  api.getFavoriteDetail(favoriteIds)
)

export const saveFavorite = createAsyncThunk<
  AddFavoriteResult,
  string,
  { state: RootState }
>('favorites/saveFavorite', favoriteName => api.addFavorite(favoriteName))

export const removeFavorite = createAsyncThunk<
  void,
  string,
  { state: RootState }
>('favorites/removeFavorite', favoriteId => api.deleteFavorite(favoriteId))

export const checkIsInAudit = createAsyncThunk<
  void,
  string,
  { state: RootState }
>('favorites/checkIsInAudit', async favoriteId => {
  try {
    await api.setFavorite({
      favorite_id_hash: favoriteId,
    })
  } catch (error: any) {
    if (error.message === '题单处于审核中，不可编辑') {
      throw new Error('题单处于审核中，不可编辑')
    }
  }
})

export const toggleFavoritePublicState = createAsyncThunk<
  void,
  string,
  { state: RootState }
>(
  'favorites/toggleFavoritePublicState',
  async (favoriteId, { getState, dispatch }) => {
    const state = getState()
    const favorite = selectFavoriteById(state, favoriteId)
    if (!favorite) {
      throw new Error('无效的 FavoriteId，可能是缓存问题，尝试刷新页面后重试')
    }
    await dispatch(checkIsInAudit(favoriteId)).unwrap()
    await api.setFavorite({
      favorite_id_hash: favorite.idHash,
      name: favorite.name,
      is_public_favorite: !favorite.isPublicFavorite,
    })
  }
)

export const updateFavoriteName = createAsyncThunk<
  string,
  { favoriteId: string; name: string },
  { state: RootState }
>(
  'favorites/updateFavoriteName',
  async ({ favoriteId, name }, { getState, dispatch }) => {
    const state = getState()
    const favorite = selectFavoriteById(state, favoriteId)
    if (!favorite) {
      throw new Error('无效的 FavoriteId，可能是缓存问题，尝试刷新页面后重试')
    }
    await dispatch(checkIsInAudit(favoriteId)).unwrap()

    await api.setFavorite({
      favorite_id_hash: favorite.idHash,
      name: name,
      is_public_favorite: favorite.isPublicFavorite,
    })
    return name
  }
)

const initialState = favoritesAdapter.getInitialState({
  customFavoriteIds: [] as string[],
  officialFavoriteIds: [] as string[],
  thirdPartyFavoriteIds: [] as string[],
})

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite(state, action: PayloadAction<string>) {
      state.customFavoriteIds.push(action.payload)
    },
    toggleFavoriteAuditStatus(state, action: PayloadAction<string>) {
      const favorite = state.entities[action.payload]
      if (favorite) favorite.isInAudit = !favorite.isInAudit
    },
    updateShowName(
      state,
      action: PayloadAction<{ idHash: string; showName: string }>
    ) {
      const favorite = state.entities[action.payload.idHash]
      if (favorite) favorite.showName = action.payload.showName
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        const { allFavorites, officialFavorites } = action.payload
        state.customFavoriteIds = allFavorites.map(({ idHash }) => idHash)
        state.officialFavoriteIds = officialFavorites.map(
          ({ idHash }) => idHash
        )

        favoritesAdapter.upsertMany(state, allFavorites)
        favoritesAdapter.upsertMany(state, officialFavorites)
        for (const favorite of allFavorites) {
          if (favorite.name.startsWith('待审核')) {
            state.entities[favorite.idHash]!.isInAudit = true
          }
        }
      })
      .addCase(fetchFavoriteDetails.fulfilled, (state, action) => {
        favoritesAdapter.upsertMany(state, action.payload as any)
      })
      .addCase(fetchFavoriteMyFavorites.fulfilled, (state, action) => {
        const set = new Set(
          state.customFavoriteIds.concat(state.officialFavoriteIds)
        )
        const data = action.payload.filter(item => !set.has(item.idHash))
        state.thirdPartyFavoriteIds = data.map(item => item.idHash)
        favoritesAdapter.upsertMany(state, data as any)
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.customFavoriteIds = state.customFavoriteIds.filter(
          id => id !== action.meta.arg
        )
      })
      .addCase(checkIsInAudit.fulfilled, (state, action) => {
        const favorite = state.entities[action.meta.arg]
        if (favorite && favorite.isInAudit) {
          favorite.isInAudit = false
        }
      })
      .addCase(
        toggleFavoritePublicState.fulfilled,
        (state, { meta: { arg: id } }) => {
          const favorite = state.entities[id]
          if (favorite) favorite.isPublicFavorite = !favorite.isPublicFavorite
        }
      )
      .addCase(
        updateFavoriteName.fulfilled,
        (
          state,
          {
            meta: {
              arg: { favoriteId },
            },
            payload: name,
          }
        ) => {
          const favorite = state.entities[favoriteId]
          if (favorite) {
            favorite.showName = name
            favorite.isInAudit = true
          }
        }
      )
  },
})

export const {
  selectAll: selectAllFavorites,
  selectById: selectFavoriteById,
  selectIds: selectFavoriteIds,
} = favoritesAdapter.getSelectors<RootState>(state => state.favorites)

export type FavoriteCategory = 'custom' | 'official' | 'third'

export const selectFavoriteIdsByCategory =
  (category: FavoriteCategory) =>
  (state: RootState): string[] =>
    state.favorites[
      category === 'custom'
        ? 'customFavoriteIds'
        : category === 'official'
        ? 'officialFavoriteIds'
        : 'thirdPartyFavoriteIds'
    ]

export const { addFavorite, toggleFavoriteAuditStatus, updateShowName } =
  favoritesSlice.actions
export default favoritesSlice.reducer
