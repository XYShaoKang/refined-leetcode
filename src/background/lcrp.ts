// Leetcode Rating Predictor

import { getContest, fileIconData, getMyRanking, MyRankingType } from './utils'

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

async function api(
  { contestId, handles }: { contestId: string; handles: string[] },
  retry = 1
): Promise<any> {
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
    return api({ contestId, handles }, retry + 1)
  } else {
    throw new Error('获取数据失败')
  }
}

type GetPredictionMessage = {
  type: 'get-prediction'
  contestId: string
  page: number
  username?: string
  region: 'local' | 'global'
}

chrome.runtime.onMessage.addListener(
  (message: GetPredictionMessage, sender, sendResponse) => {
    if (message.type === 'get-prediction') {
      getPrediction(message, sender, sendResponse)
      return true
    }
  }
)

chrome.runtime.onMessageExternal.addListener(function (
  message: GetPredictionMessage,
  sender,
  sendResponse
) {
  if (message.type === 'get-prediction') {
    getPrediction(message, sender, sendResponse)
    return true
  }
})

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

let myRankCache: MyRankingType

async function getPrediction(
  message: GetPredictionMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  const { contestId, region } = message
  const { questions, submissions, total_rank } = await getContest(
    contestId,
    message.page,
    region
  )
  const usernames = total_rank.map(({ username }) => username)
  if (message.username) {
    usernames.unshift(message.username)
    myRankCache = myRankCache || (await getMyRanking(contestId))
    submissions.unshift(myRankCache.my_submission)
  }

  const iconMap = new Map<string, string>()
  for (const { slug, file } of fileIconData) {
    iconMap.set(slug, `chrome-extension://${chrome.runtime.id}${file}`)
  }

  try {
    const data = (await api({ contestId, handles: usernames })) as PredictorType
    const itemMap = new Map<string, PredictorType['items']['0']>()
    for (const item of data.items) {
      itemMap.set(item._id, item)
    }
    const items = []
    for (let i = 0; i < usernames.length; i++) {
      const username = usernames[i]
      const submission = questions.map(({ question_id }) => {
        const submission = submissions[i][question_id]

        return { ...submission, iconFile: iconMap.get(submission?.lang ?? '') }
      })
      items.push({ ...itemMap.get(username), submission })
    }

    sendResponse(items)
  } catch (error) {
    // TODO
  }
}

export {}
