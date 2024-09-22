import {
  useAppDispatch,
  useAppSelector,
  useEffectMount,
  useEvent,
} from '@/hooks'
import { gkey, PreviousRatingDataType } from '@/utils'
import { useEffect, useState } from 'react'
import { debounce } from 'src/utils'
import {
  fetchPreviousRatingData,
  selectUserPredict,
  selectPreviousSeeds,
  setUserDelta,
  selectPreviousRatingDataStatus,
  fetchUserRating,
  selectUserRanking,
  selectFetchContestRankingState,
} from './rankSlice'

export type User = { region: string; username: string; oldUsername?: string }

/** 获取当前行的用户信息
 *
 * @param hasMyRank 当前用户是否参赛
 * @param index 第几行
 * @param row 行元素
 * @returns
 */
export function getUsername(
  hasMyRank: boolean,
  index: number,
  row: HTMLElement,
  beta?: boolean
): User {
  let region = '',
    username = ''
  if (!beta && index === 0 && hasMyRank) {
    region = 'CN'
    username = (window as any)?.LeetCodeData?.userStatus?.user_slug
  } else {
    if (beta) {
      const a = row.children[0].children[0].children[0] as HTMLAnchorElement
      if (a.host === 'leetcode.com') {
        region = 'US'
      } else {
        region = 'CN'
      }
      username = a.pathname?.split('/').filter(Boolean)[1]
    } else {
      const a = row.children[1].children[0] as HTMLAnchorElement
      if (a.host === 'leetcode.com') {
        region = 'US'
        username = a.pathname.split('/').filter(Boolean)[0]
      } else {
        region = 'CN'
        username = a.pathname.split('/').filter(Boolean)[1]
      }
    }
  }
  return { region, username }
}

/** 当前行发生改变是触发事件
 */
export const useRowChange = (
  row: HTMLElement,
  onChange: () => void,
  beta?: boolean
): void => {
  useEffect(() => {
    const handleChange = debounce(() => {
      onChange()
    }, 100)
    handleChange()
    const observer = new MutationObserver(handleChange)
    observer.observe(row, { attributes: true, childList: true })
    return () => {
      handleChange.cancel()
      observer.disconnect()
    }
  }, [onChange, row])
}

/** 响应式获取当前行的用户信息
 */
export const useUser = (
  hasMyRank: boolean,
  index: number,
  row: HTMLElement,
  beta?: boolean
): User => {
  const [state, setState] = useState(getUsername(hasMyRank, index, row, beta))
  const handleChange = useEvent(() => {
    setState(getUsername(hasMyRank, index, row, beta))
  })
  useRowChange(row, handleChange, beta)
  return state
}

/** 获取预测数据
 *
 */
export const useFetchPreviousRatingData = (contestSlug: string): void => {
  const dispatch = useAppDispatch()
  useEffectMount(
    async state => {
      let cnt = 5
      while (cnt--) {
        if (!state.isMount) break
        try {
          const promise = dispatch(
            fetchPreviousRatingData({ contestSlug: contestSlug })
          )
          state.unmount.push(() => promise.abort())
          await promise
          break
        } catch (error) {
          //
        }
      }
    },
    [dispatch, contestSlug]
  )
}

// TODO: 研究是否有更快的实现
export const usePredict = ({
  contestSlug,
  region,
  username,
}: {
  region: string
  username: string
  contestSlug: string
}): void => {
  const dispatch = useAppDispatch()
  const { oldRating, acc, preCache, rank } =
    useAppSelector(state =>
      selectUserPredict(state, contestSlug, region, username, true)
    ) ?? {}

  const seeds = useAppSelector(state => selectPreviousSeeds(state, contestSlug))
  const previousRatingDataStatus = useAppSelector(state =>
    selectPreviousRatingDataStatus(state, contestSlug)
  )
  const fetchContestRankingState = useAppSelector(state =>
    selectFetchContestRankingState(state, contestSlug)
  )

  const user = useAppSelector(state =>
    selectUserRanking(state, contestSlug, region, username)
  )

  useEffect(() => {
    if (
      previousRatingDataStatus === 'succeeded' &&
      fetchContestRankingState === 'succeeded' &&
      oldRating === undefined
    ) {
      // 表示 previousRatingData 中不包含指定用户的数据，这时需要实时从 LeetCode 中获取数据，以完成实时预测
      dispatch(fetchUserRating({ region, username, contestSlug }))
    }
  }, [
    previousRatingDataStatus,
    oldRating,
    dispatch,
    region,
    username,
    contestSlug,
    fetchContestRankingState,
  ])

  useEffectMount(async () => {
    if (
      previousRatingDataStatus !== 'succeeded' ||
      fetchContestRankingState !== 'succeeded' ||
      !user
    )
      return

    if (seeds && oldRating !== undefined) {
      if (rank) {
        const cache = rank * 1e4 + oldRating
        // 如果 rank 和 oldRating 一样的话，则计算结果也会一样，就没必要重复计算了
        if (preCache === cache) return
      }
      const key = gkey(region, username)
      dispatch(
        setUserDelta({
          contestSlug,
          key,
        })
      )
    }
  }, [
    rank,
    seeds,
    acc,
    oldRating,
    region,
    username,
    dispatch,
    contestSlug,
    preCache,
    previousRatingDataStatus,
    fetchContestRankingState,
    user,
  ])
}

export function findRank(
  previousRatingData: PreviousRatingDataType,
  user_score: number,
  user_finishTime: number
): number {
  // 通过用户当前的分数和完成时间，计算 Rank
  // 对于正在进行的比赛来说，榜单上的 Rank 并不是实时的，会有一定的延迟
  // 而这种方式计算 Rank 则比较依赖于 previousRatingData 数据的准确性
  const { totalRank } = previousRatingData
  const check = (m: number) => {
    const { score, finish_time } = totalRank[m]
    return (
      user_score < score ||
      (user_score === score && user_finishTime > finish_time)
    )
  }
  let l = 0,
    r = totalRank.length

  while (l < r) {
    const m = (l + r) >> 1
    if (check(m)) {
      l = m + 1
    } else {
      r = m
    }
  }
  return l + 1
}
