import { sleep, cache } from '.'

export type PredictorType = {
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

// @see: https://github.com/SysSn13/leetcode-rating-predictor/blob/4a7f4057bd5bf94727723b0bc02d781be573a3eb/chrome-extension/background.js#L26
const LCRP_API = [
  'https://leetcode-predictor.herokuapp.com/api/v1/predictions',
  'https://leetcode-rating-predictor.herokuapp.com/api/v1/predictions',
]
let API_INDEX = 0
const RETRY_COUNT = 5

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

export const predictorApi = cache(
  ({ contestId, handles }: { contestId: string; handles: string[] }) =>
    contestId + ',' + handles.sort().join(','),
  async function predictorApi(
    { contestId, handles },
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
      throw new Error('获取预测数据失败')
    }
  }
)
