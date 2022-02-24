import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import { getExtensionId } from '../../utils'

type GetPredictionMessage =
  | {
      type: 'get-prediction'
      contestId: string
      page: number
      region: 'local' | 'global'
    }
  | {
      type: 'get-prediction'
      contestId: string
      usernames: string[]
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
    getPrediction: builder.query({
      query: params => ({
        message: {
          type: 'get-prediction',
          ...params,
        },
      }),
    }),
  }),
})

export const { useGetPredictionQuery } = apiSlice
