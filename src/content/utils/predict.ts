// 预测算法
export function predictHelper(
  previousRatings: number[],
  rating: number,
  rank: number,
  attendedContestsCount: number
): number {
  const f = (() => {
    let cache: number[]
    return (k: number) => {
      if (k > 100) return 3.5
      if (!cache) {
        cache = []
        for (let i = 0; i <= 100; i++) {
          cache[i] = (cache[i - 1] ?? 0) + Math.pow(5 / 7, i)
        }
      }
      return cache[k] ?? 3.5
    }
  })()
  const n = previousRatings.length

  // a 对 b 期望胜率
  function getWinProbability(a: number, b: number) {
    return 1 / (1 + 10 ** ((b - a) / 400))
  }

  // 计算其他参赛者对当前玩家的期望胜率之和
  const calcExpectedRank = (rating: number, hasSelf = false) => {
    let res = 1
    for (let i = 0; i < n; i++) {
      if (hasSelf && rating === previousRatings[i]) {
        hasSelf = false
        continue
      }
      res += getWinProbability(previousRatings[i], rating)
    }
    return res
  }

  const erank = calcExpectedRank(rating, true)

  const m = Math.sqrt(erank * rank)

  let l = 0,
    r = 5000
  while (r - l > 1e-2) {
    const mid = (l + r) / 2
    if (calcExpectedRank(mid) < m) {
      r = mid
    } else {
      l = mid
    }
  }

  const d = (l - rating) / (1 + f(attendedContestsCount))
  return d
}
const script = `
const predictHelper = ${predictHelper.toString()}
self.onmessage = ({
  data: { previousRatings, rating, rank, attendedContestsCount },
}) => {
  const res = predictHelper(
    previousRatings,
    rating,
    rank,
    attendedContestsCount
  )
  self.postMessage(res)
}`
const blob = new Blob([script], { type: 'application/javascript' })
export const predict = async (
  previousRatings: number[],
  rating: number,
  rank: number,
  attendedContestsCount: number
): Promise<number> => {
  if (window.Worker) {
    const worker = new Worker(URL.createObjectURL(blob))
    return new Promise(function (resolve) {
      worker.onmessage = e => {
        worker.terminate()
        resolve(e.data)
      }
      worker.postMessage({
        previousRatings,
        rating,
        rank,
        attendedContestsCount,
      })
    })
  } else {
    return predictHelper(previousRatings, rating, rank, attendedContestsCount)
  }
}
