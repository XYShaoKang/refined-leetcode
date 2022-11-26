// Leetcode Rating Predictor
import {
  getContest,
  fileIconData,
  getMyRanking,
  lbaoPredictorApi as predictorApi,
} from './utils'

type GetContestMessage = {
  type: 'get-contest'
  contestId: string
  page: number
  username?: string
  region: 'local' | 'global'
}

type GetPredictionMessage = {
  type: 'get-prediction'
  contestId: string
  page: number
  username?: string
  region: 'local' | 'global'
}

const messageHandle = (
  message: GetPredictionMessage | GetContestMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  if (message.type === 'get-prediction') {
    getPredictionHandle(message, sender, sendResponse)
    return true
  } else if (message.type === 'get-contest') {
    getContestHandle(message, sender, sendResponse)
    return true
  }

  const _exhaustiveCheck: never = message
  return _exhaustiveCheck
}

chrome.runtime.onMessage.addListener(messageHandle)
chrome.runtime.onMessageExternal.addListener(messageHandle)

async function getContestHandle(
  message: GetContestMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  const { contestId, region, page, username } = message

  let { questions, submissions } = await getContest(contestId, page, region)

  if (username) {
    const myRankCache = await getMyRanking(contestId)
    submissions = [myRankCache.my_submission, ...submissions]
  }

  const iconMap = new Map<string, string>()
  for (const { slug, file } of fileIconData) {
    iconMap.set(slug, `chrome-extension://${chrome.runtime.id}${file}`)
  }

  const res = submissions.map(submission => {
    return questions.map(({ question_id }) => {
      const item = submission[question_id]

      return {
        ...item,
        iconFile: iconMap.get(item?.lang ?? ''),
      }
    })
  })

  sendResponse(res)
}

async function getPredictionHandle(
  message: GetPredictionMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  const { contestId, region, page, username } = message

  const { total_rank } = await getContest(contestId, page, region)
  let users = total_rank.map(({ username, data_region }) => ({
    username,
    data_region,
  }))

  if (username) {
    users = [{ username, data_region: 'CN' }, ...users]
  }

  try {
    const data = await predictorApi(contestId, users)

    const itemMap = new Map(data.map(item => [item.username, item]))

    sendResponse(users.map(user => itemMap.get(user.username)))
  } catch (error) {
    // TODO
  }
}
