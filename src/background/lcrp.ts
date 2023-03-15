// Leetcode Rating Predictor
import { gkey, graphqlApi } from '@/utils'
import {
  fileIconData,
  lbaoPredictorApi as predictorApi,
  LbaoPredictorType,
} from './utils'

type GetPredictionMessage = {
  type: 'get-prediction'
  contestSlug: string
  users: { username: string; region: string }[]
}
type GetFileIcons = {
  type: 'get-file-icons'
}
type GetUserRanking = {
  type: 'get-user-ranking'
  username: string
}

const messageHandle = (
  message: GetPredictionMessage | GetFileIcons | GetUserRanking,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  if (message.type === 'get-prediction') {
    getPredictionHandle(message, sender, sendResponse)
    return true
  } else if (message.type === 'get-file-icons') {
    getFileIcons(message, sender, sendResponse)
    return true
  } else if (message.type === 'get-user-ranking') {
    getUserRanking(message, sender, sendResponse)
    return true
  }

  const _exhaustiveCheck: never = message
  return _exhaustiveCheck
}

chrome.runtime.onMessage.addListener(messageHandle)
chrome.runtime.onMessageExternal.addListener(messageHandle)

async function getFileIcons(
  message: GetFileIcons,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  const res: { [key: string]: string } = {}
  for (const { slug, file } of fileIconData) {
    res[slug] = `chrome-extension://${chrome.runtime.id}${file}`
  }
  sendResponse(res)
}

const cache = new Map<string, LbaoPredictorType>()
async function getPredictionHandle(
  message: GetPredictionMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  const { contestSlug, users } = message

  try {
    const tmp = users
      .filter(a => !cache.has(gkey(a.region, a.username)))
      .map(a => ({ data_region: a.region, username: a.username }))
    if (tmp.length) {
      const data = await predictorApi(contestSlug, tmp)
      for (const item of data) {
        const key = gkey(item.data_region, item.username)
        cache.set(key, item)
      }
    }

    sendResponse(users.map(user => cache.get(gkey(user.region, user.username))))
  } catch (error) {
    // TODO
  }
}
async function getUserRanking(
  message: GetUserRanking,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  const { username } = message
  try {
    const { data } = await graphqlApi<{ data: any }>('https://leetcode.com', {
      body: {
        variables: { username: username },
        query: /* GraphQL */ `
          query userContestRankingInfo($username: String!) {
            userContestRanking(username: $username) {
              attendedContestsCount
              rating
              globalRanking
              totalParticipants
              topPercentage
            }
            userContestRankingHistory(username: $username) {
              attended
              trendDirection
              problemsSolved
              totalProblems
              finishTimeInSeconds
              rating
              ranking
              contest {
                titleSlug
                title
                startTime
              }
            }
          }
        `,
      },
    })

    sendResponse(data)
  } catch (error) {
    // TODO
  }
}
