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

export type MyRankingType = {
  my_solved: number[]
  registered: boolean
  fallback_local: boolean
  my_submission: { [key: number]: SubmissionType }
  my_rank: RankType
}

export async function getContest(
  contestId: string,
  page: number,
  region: 'local' | 'global' = 'local',
  retry = 1
): Promise<RankingDataType> {
  const url = `https://leetcode.com/contest/api/ranking/${contestId}/?pagination=${page}&region=${region}`
  const res = await fetch(url)
  if (res.status === 200) {
    return res.json()
  }
  if (retry > 5) throw new Error('获取 Contest 数据失败')
  return getContest(contestId, page, region, retry + 1)
}

export async function getMyRanking(
  contestId: string,
  retry = 1
): Promise<MyRankingType> {
  const url = `https://leetcode.com/contest/api/myranking/${contestId}/`
  const res = await fetch(url)

  if (res.status === 200) return res.json()

  if (retry > 5) throw new Error('获取 Rank 数据失败')
  return getMyRanking(contestId, retry + 1)
}

export const fileIconData = [
  {
    slug: 'cpp',
    lang: 'C++',
    file: '/file-icons/cpp.svg',
  },
  {
    slug: 'java',
    lang: 'Java',
    file: '/file-icons/java.svg',
  },
  {
    slug: 'python',
    lang: 'Python',
    file: '/file-icons/python.svg',
  },
  // {
  //   slug: 'mysql',
  //   lang: 'MySQL',
  //   file: '/file-icons/mysql.svg',
  // },
  {
    slug: 'c',
    lang: 'C',
    file: '/file-icons/c.svg',
  },
  {
    slug: 'csharp',
    lang: 'C#',
    file: '/file-icons/csharp.svg',
  },
  {
    slug: 'javascript',
    lang: 'JavaScript',
    file: '/file-icons/javascript.svg',
  },
  {
    slug: 'ruby',
    lang: 'Ruby',
    file: '/file-icons/ruby.svg',
  },
  // {
  //   slug: 'bash',
  //   lang: 'Bash',
  //   file: '/file-icons/bash.svg',
  // },
  {
    slug: 'swift',
    lang: 'Swift',
    file: '/file-icons/swift.svg',
  },
  {
    slug: 'golang',
    lang: 'Go',
    file: '/file-icons/golang.svg',
  },
  {
    slug: 'python3',
    lang: 'Python3',
    file: '/file-icons/python3.svg',
  },
  {
    slug: 'scala',
    lang: 'Scala',
    file: '/file-icons/scala.svg',
  },
  {
    slug: 'kotlin',
    lang: 'Kotlin',
    file: '/file-icons/kotlin.svg',
  },
  {
    slug: 'rust',
    lang: 'Rust',
    file: '/file-icons/rust.svg',
  },
  {
    slug: 'php',
    lang: 'PHP',
    file: '/file-icons/php.svg',
  },
  {
    slug: 'typescript',
    lang: 'TypeScript',
    file: '/file-icons/typescript.svg',
  },
  {
    slug: 'racket',
    lang: 'Racket',
    file: '/file-icons/racket.svg',
  },
  {
    slug: 'erlang',
    lang: 'Erlang',
    file: '/file-icons/erlang.svg',
  },
  {
    slug: 'elixir',
    lang: 'Elixir',
    file: '/file-icons/elixir.svg',
  },
]
