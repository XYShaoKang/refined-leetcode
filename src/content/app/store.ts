import { configureStore } from '@reduxjs/toolkit'
// import devToolsEnhancer from 'remote-redux-devtools'

import { apiSlice } from '../pages/ranking/rankSlice'

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  devTools: false,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  enhancers: [
    // 配置 Redux DevTools
    // devToolsEnhancer({
    //   hostname: 'localhost',
    //   port: 8000,
    //   realtime: true,
    // }),
  ],
})

export default store

export type RootState = ReturnType<typeof store.getState>
