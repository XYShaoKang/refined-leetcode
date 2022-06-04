import { cache } from '.'

export type SubmissionType = {
  id: number
  date: number
  question_id: number
  submission_id: number
  status: number
  contest_id: number
  data_region: string
  fail_count: number
  lang: string
}
export type QuestionType = {
  id: number
  question_id: number
  credit: number
  title: string
  english_title: string
  title_slug: string
  category_slug: string
}
export type RankType = {
  contest_id: number
  username: string
  user_slug: string
  real_name: string
  country_code: string
  country_name: string
  rank: number
  score: number
  finish_time: number
  global_ranking: number
  data_region: string
  avatar_url: string
  rank_v2: number
}

export type RankingDataType = {
  is_past: boolean
  submissions: {
    [key: number]: SubmissionType
  }[]
  questions: QuestionType[]
  total_rank: RankType[]
  user_num: number
}

export const getContest = cache(
  (contestId: string, page: number, region: 'local' | 'global' = 'local') =>
    `${contestId}-${page}-${region}`,
  async function getContest(
    contestId: string,
    page: number,
    region: 'local' | 'global' = 'local',
    retry = 1
  ): Promise<RankingDataType> {
    const url = `https://leetcode.cn/contest/api/ranking/${contestId}/?pagination=${page}&region=${region}`
    const res = await fetch(url)
    if (res.status === 200) {
      return res.json()
    }
    if (retry > 5) throw new Error('获取 Contest 数据失败')
    return getContest(contestId, page, region, retry + 1)
  }
)

export type MyRankingType = {
  my_solved: number[]
  registered: boolean
  fallback_local: boolean
  my_submission: { [key: number]: SubmissionType }
  my_rank: RankType
}

export const getMyRanking = cache(
  (contestId: string) => contestId,
  async function getMyRanking(
    contestId: string,
    retry = 1
  ): Promise<MyRankingType> {
    const url = `https://leetcode.cn/contest/api/myranking/${contestId}/`
    const res = await fetch(url)

    if (res.status === 200) return res.json()

    if (retry > 5) throw new Error('获取 Rank 数据失败')
    return getMyRanking(contestId, retry + 1)
  }
)
