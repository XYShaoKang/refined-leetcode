// Leetcode Rating Predictor

import { getContest, fileIconData, getMyRanking } from './utils'

// @see: https://github.com/SysSn13/leetcode-rating-predictor/blob/4a7f4057bd5bf94727723b0bc02d781be573a3eb/chrome-extension/background.js#L26
const LCRP_API = [
  'https://leetcode-predictor.herokuapp.com/api/v1/predictions',
  'https://leetcode-rating-predictor.herokuapp.com/api/v1/predictions',
]
let API_INDEX = 0
const RETRY_COUNT = 5

function sleep(time: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

const changeApiIndex = (() => {
  let enable = true
  return () => {
    if (enable) {
      API_INDEX = (API_INDEX + 1) % LCRP_API.length

      enable = false
      setTimeout(() => {
        enable = true
      }, 2000)
    }
  }
})()

type PredictorType = {
  status: string
  meta: {
    contest_id: string
    total_count: number
  }
  items: {
    data_region: string
    delta: number
    _id: string
  }[]
}

async function predictorApi(
  { contestId, handles }: { contestId: string; handles: string[] },
  retry = 1
): Promise<PredictorType> {
  const baseUrl = LCRP_API[API_INDEX]
  const url = new URL(baseUrl)
  url.searchParams.set('contestId', contestId)
  url.searchParams.set('handles', handles.join(';'))

  const res = await fetch(url.toString())
  if (res.status === 200) {
    return res.json()
  } else if (retry < RETRY_COUNT) {
    // 换一个 API 试试
    changeApiIndex()
    await sleep(2 ** retry * 100)
    return predictorApi({ contestId, handles }, retry + 1)
  } else {
    throw new Error('获取数据失败')
  }
}

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

  const { questions, submissions } = await getContest(contestId, page, region)

  if (username) {
    const myRankCache = await getMyRanking(contestId)
    submissions.unshift(myRankCache.my_submission)
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
  const { contestId, region } = message
  const { submissions, total_rank } = await getContest(
    contestId,
    message.page,
    region
  )
  const usernames = total_rank.map(({ username }) => username)
  if (message.username) {
    usernames.unshift(message.username)
    const myRankCache = await getMyRanking(contestId)
    submissions.unshift(myRankCache.my_submission)
  }

  try {
    const data = await predictorApi({
      contestId,
      handles: usernames,
    })

    const itemMap = new Map<string, PredictorType['items']['0']>()
    for (const item of data.items) {
      itemMap.set(item._id, item)
    }

    sendResponse(usernames.map(username => itemMap.get(username)!))
  } catch (error) {
    // TODO
  }
}
