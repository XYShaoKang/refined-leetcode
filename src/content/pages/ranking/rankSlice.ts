import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react'

import { getExtensionId } from '@/utils'

export type ParamType = {
  contestId: string
  page: number
  username?: string
  region: 'local' | 'global'
}

type GetPredictionMessage =
  | {
      type: 'get-prediction'
      contestId: string
      page: number
      username?: string
      region: 'local' | 'global'
    }
  | {
      type: 'get-contest'
      contestId: string
      page: number
      username?: string
      region: 'local' | 'global'
    }

type ArgsType = { message: GetPredictionMessage }

const customBaseQuery = (): BaseQueryFn<ArgsType, unknown, unknown> => {
  const extensionId = getExtensionId()!
  return async ({ message }) => {
    return new Promise(function (resolve) {
      chrome.runtime.sendMessage(extensionId, message, function (response) {
        resolve({ data: response })
      })
    })
  }
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
    getContest: builder.query<any, ParamType>({
      query: params => ({
        message: {
          type: 'get-contest',
          ...params,
        },
      }),
    }),
  }),
})

export const { useGetPredictionQuery, useGetContestQuery } = apiSlice
