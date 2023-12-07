import { FFTConv } from './conv'

/**
 * @param k 参赛次数
 */
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

/** 预测算法
 *
 * @param seeds 种子数据
 * @param rating 当前选手的分数
 * @param rank 当前算寿的排名
 * @param attendedContestsCount 当前选手参赛次数
 * @returns
 */
export const predict = (
  seeds: number[],
  rating: number,
  rank: number,
  attendedContestsCount: number
): number => {
  const erank = getERank(seeds, rating)

  const m = Math.sqrt(erank * rank)

  let l = 0,
    r = MAX_RATING
  while (l < r) {
    const mid = Math.floor((l + r) / 2)
    if (getSeed(seeds, mid) < m) {
      r = mid
    } else {
      l = mid + 1
    }
  }

  const d = (l - rating * ACCURACY) / (1 + f(attendedContestsCount))
  return d / ACCURACY
}

//#region 由 [@tiger2005](https://leetcode.cn/u/tiger2005/) 编写
const ACCURACY = 10
const MAX_RATING = 8000 * ACCURACY

/** 预处理 seeds
 *
 * @param previousRatings 当前比赛所有选手的 rating 数据
 * @returns
 */
export const calcSeed = (previousRatings: number[]): number[] => {
  const FFT = new FFTConv(3 * MAX_RATING + 1)

  const ELO_PROB_REV = new Array(2 * MAX_RATING + 1)
  for (let i = -MAX_RATING; i <= MAX_RATING; i++) {
    ELO_PROB_REV[i + MAX_RATING] = 1 / (1 + Math.pow(10, i / (400 * ACCURACY)))
  }
  const freq: number[] = new Array(MAX_RATING + 1).fill(0)
  for (let rating of previousRatings) {
    rating = Math.round(rating * ACCURACY)
    freq[rating]++
  }

  const seeds = FFT.convolve(ELO_PROB_REV, freq)
  return seeds
}

/** 获取当前选手的期望胜率
 *
 * @param seeds 种子数据
 * @param x 当前选手的 rating
 * @returns
 */
export const getERank = (seeds: number[], x: number): number => {
  x = Math.round(x * ACCURACY)
  return seeds[x + MAX_RATING] + 0.5
}

/** 获取某个分数 x 的期望胜率
 *
 * @param seeds 种子数据
 * @param x 真实分数*ACCURACY
 * @returns
 */
export const getSeed = (seeds: number[], x: number): number => {
  return seeds[x + MAX_RATING] + 1
}
//#endregion
