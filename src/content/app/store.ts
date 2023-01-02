import { configureStore } from '@reduxjs/toolkit'
// import devToolsEnhancer from 'remote-redux-devtools'
import {
  createStateSyncMiddleware,
  initMessageListener,
} from 'redux-state-sync'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { apiSlice } from '@/pages/ranking/rankSlice'
import postsReducer from '@/pages/home/postsSlice'
import blockUsersReducer from '@/pages/home/blockUsersSlice'
import globalDataReducer, { fetchGlobalData } from '@/pages/global/globalSlice'
import optionReducer from '@/pages/global/optionSlice'
import favoritesReducer from '@/pages/problem-list/favoriteSlice'

const config = {
  whitelist: [
    'users/setBlockUserBySlug/fulfilled',
    'users/setBlockUserByPostId/fulfilled',
    'users/setBlockUserByCommunityArticleId/fulfilled',
    'users/setBlockUserBySolutionSlug/fulfilled',
    'blockUsers/unSetBlockUser',
    'blockUsers/toggleBlockUser',
    'global/fetchGlobalData/fulfilled',
  ],
}

const persistConfig = {
  key: 'refined-leetcode',
  storage,
  migrate: (state: any) => {
    const key = 'BlockUserList'
    const data = localStorage.getItem(key)
    // 迁移老版本的数据，如果存在的话
    if (data) {
      try {
        const blockUserList: {
          slug: string
          name: string
        }[] = JSON.parse(data)

        if (!state) state = {}
        if (!state.entities) {
          state.entities = {}
          state.ids = []
        }

        for (const { slug, name } of blockUserList) {
          if (!state.entities[slug]) {
            state.entities[slug] = { slug, name, block: true }
            state.ids.push(slug)
          }
        }
      } catch (error) {
        //
      }
    }
    // console.log('Migration Running!', state)
    return Promise.resolve(state)
  },
}

const persistedUsersReducer = persistReducer(persistConfig, blockUsersReducer)

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    posts: postsReducer,
    blockUsers: persistedUsersReducer,
    global: globalDataReducer,
    option: optionReducer,
    favorites: favoritesReducer,
  },
  devTools: false,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(apiSlice.middleware)
      .concat(createStateSyncMiddleware(config)),
  enhancers: [
    // 配置 Redux DevTools
    // devToolsEnhancer({
    //   hostname: 'localhost',
    //   port: 8000,
    //   realtime: true,
    // }),
  ],
})

export const persistor = persistStore(store)

initMessageListener(store)

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

store.dispatch(fetchGlobalData())
