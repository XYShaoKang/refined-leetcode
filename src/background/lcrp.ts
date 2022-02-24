// Leetcode Rating Predictor

const LCRP_API =
  'https://leetcode-rating-predictor.herokuapp.com/api/v1/predictions'
const RETRY_COUNT = 10

async function api(url: string, retry = 1): Promise<any> {
  const res = await fetch(url)
  if (res.status === 200) {
    return res.json()
  } else if (retry < RETRY_COUNT) {
    return api(url, retry + 1)
  } else {
    throw new Error('获取数据失败')
  }
}

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

async function getContest(
  contestId: string,
  page: number,
  region: 'local' | 'global' = 'local',
  retry = 1
): Promise<any> {
  const url = `https://leetcode-cn.com/contest/api/ranking/${contestId}/?pagination=${page}&region=${region}`
  const res = await fetch(url)
  if (res.status === 200) {
    return res.json()
  }
  return getContest(contestId, page, region, retry + 1)
}

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

async function getPrediction(
  message: GetPredictionMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  let usernames: string[]
  const { contestId, region } = message
  if ('page' in message) {
    const contestData = await getContest(contestId, message.page, region)
    usernames = (contestData.total_rank as { username: string }[]).map(
      ({ username }) => username
    )
  } else {
    usernames = message.usernames
  }

  const url = new URL(LCRP_API)
  url.searchParams.set('contestId', contestId)
  url.searchParams.set('handles', usernames.join(';'))
  try {
    const data = (await api(url.toString())) as PredictorType
    const itemMap = new Map<string, PredictorType['items']['0']>()
    for (const item of data.items) {
      itemMap.set(item._id, item)
    }
    const items = []
    for (const username of usernames) {
      items.push({ ...itemMap.get(username) })
    }

    sendResponse(items)
  } catch (error) {
    // TODO
  }
}

export {}
