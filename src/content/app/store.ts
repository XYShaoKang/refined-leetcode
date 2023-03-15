import { configureStore, ConfigureStoreOptions } from '@reduxjs/toolkit'
import {
  createStateSyncMiddleware,
  initMessageListener,
} from 'redux-state-sync'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import localforage from 'localforage'

import { apiSlice, contestInfosSlice } from '@/pages/ranking/rankSlice'
import postsReducer from '@/pages/home/postsSlice'
import blockUsersReducer from '@/pages/home/blockUsersSlice'
import globalDataReducer, { fetchGlobalData } from '@/pages/global/globalSlice'
import optionsReducer from '@/pages/global/optionsSlice'
import favoritesReducer from '@/pages/problem-list/favoriteSlice'
import questionsReducer from '@/pages/problemset/questionsSlice'

// debug
// import logger from 'redux-logger'
// import devToolsEnhancer from 'remote-redux-devtools'
const enhancers: ConfigureStoreOptions['enhancers'] = [
  // 配置 Redux DevTools
  // devToolsEnhancer({
  //   hostname: 'localhost',
  //   port: 8000,
  //   realtime: true,
  // }),
]

const config = {
  whitelist: [
    'users/setBlockUserBySlug/fulfilled',
    'users/setBlockUserByPostId/fulfilled',
    'users/setBlockUserByCommunityArticleId/fulfilled',
    'users/setBlockUserBySolutionSlug/fulfilled',
    'blockUsers/unSetBlockUser',
    'blockUsers/toggleBlockUser',
    'global/fetchGlobalData/fulfilled',
    'options/toggleContestProblemShortcutKeyOption',
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
const persistedQuestionsReducer = persistReducer(
  {
    key: 'refined-leetcode-questions',
    storage: localforage,
  },
  questionsReducer
)
const persistedOptionsReducer = persistReducer(
  {
    key: 'refined-leetcode-option',
    storage: localforage,
  },
  optionsReducer
)

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    posts: postsReducer,
    blockUsers: persistedUsersReducer,
    global: globalDataReducer,
    options: persistedOptionsReducer,
    favorites: favoritesReducer,
    questions: persistedQuestionsReducer,
    contestInfos: contestInfosSlice.reducer,
  },
  devTools: false,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    })
      .concat(apiSlice.middleware)
      .concat(createStateSyncMiddleware(config)), //.concat(logger)
  enhancers,
})

export const persistor = persistStore(store)

initMessageListener(store)

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

store.dispatch(fetchGlobalData())
