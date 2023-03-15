import { previousMonday } from 'date-fns/fp'
import JSON5 from 'json5'
import { logger } from '../../utils'
import { isObject, sleep } from './utils'

const log = logger.child({ prefix: 'page-utils' })

export function globalGetStatusText(e: number): string {
  switch (e) {
    case 10:
      return 'Accepted'
    case 11:
      return 'Wrong Answer'
    case 12:
      return 'Memory Limit Exceeded'
    case 13:
      return 'Output Limit Exceeded'
    case 14:
      return 'Time Limit Exceeded'
    case 15:
      return 'Runtime Error'
    case 16:
      return 'Internal Error'
    case 20:
      return 'Compile Error'
    case 21:
      return 'Unknown Error'
    case 30:
      return 'Timeout'
    default:
      return 'Invalid Error Code'
  }
}

export function graphqlApi<T>(
  REGION_URL: string,
  {
    endpoint,
    method,
    body,
  }: { endpoint?: string; method?: string; body?: unknown },
  retry = 1
): Promise<T> {
  method = method || 'POST'
  const RETRY_TIME = 3000,
    RETRY_COUNT = 5
  const url = endpoint ? `${REGION_URL}/${endpoint}` : `${REGION_URL}/graphql/`
  return fetch(url, {
    headers: {
      'content-type': 'application/json',
    },
    referrer: `${REGION_URL}/`,
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: JSON.stringify(body),
    method,
    mode: 'cors',
    credentials: 'include',
  }).then(res => {
    if (res.status >= 200 && res.status < 300) {
      return res.json()
    }

    if (res.status === 429) {
      log.debug(`超出接口限制,休息一下,等待第${retry}次重试...`)
      if (retry > RETRY_COUNT) {
        throw new Error(
          `已重试 ${RETRY_COUNT} 次,仍然无法获取,可能力扣君生气了,晚点在试试吧...`
        )
      }
      // 触发限制之后,等一会儿在进行请求
      return sleep(RETRY_TIME).then(() =>
        graphqlApi(REGION_URL, { method, body }, retry + 1)
      )
    }

    throw new Error(`未知状态: ${res.status}`)
  })
}

export function baseApi(
  REGION_URL: string,
  url: string,
  method = 'GET',
  body: null | object = null,
  retry = 1
): Promise<any> {
  const RETRY_TIME = 20000,
    RETRY_COUNT = 10

  method = method.toUpperCase()
  let bodyStr: null | string
  const headers: HeadersInit = {
    accept: 'application/json, text/plain, */*',
  }

  if (method === 'GET') {
    bodyStr = null
  } else {
    if (isObject(body)) {
      bodyStr = isObject(body) ? JSON.stringify(body) : body
      headers['content-type'] = 'application/json'
    } else {
      bodyStr = body
    }
  }

  return fetch(REGION_URL + url, {
    headers,
    referrer: location.href,
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: bodyStr,
    method,
    mode: 'cors',
    credentials: 'include',
  }).then(async res => {
    if (res.status >= 200 && res.status < 300) {
      return res
    }

    if (res.status === 429) {
      log.debug(`超出接口限制,休息一下,等待第${retry}次重试...`)
      if (retry > RETRY_COUNT) {
        throw new Error(
          `已重试 ${RETRY_COUNT} 次,仍然无法获取,可能力扣君生气了,晚点在试试吧...`
        )
      }
      // 触发限制之后,等一会儿在进行请求
      return sleep(RETRY_TIME).then(() =>
        baseApi(REGION_URL, url, method, body, retry + 1)
      )
    }
    if (res.status === 400) {
      let error: string
      try {
        const data = await res.json()
        error = data.error
      } catch (error) {
        throw new Error(`错误状态: ${res.status}`)
      }
      throw new Error(error)
    }
    throw new Error(`未知状态: ${res.status}`)
  })
}

interface GlobalSubmissionDetail {
  submissionData: {
    status_code: number
    runtime: string
    memory: string
    total_correct: string
    total_testcases: string
    compare_result: string
    input_formatted: string
    input: string
    expected_output: string
    code_output: string
    last_testcase: string
  }
  questionId: string
  submissionId: string
  sessionId: string
  getLangDisplay: string
  submissionCode: string
  editCodeUrl: string
  checkUrl: string
  runtimeDistributionFormatted: string
  memoryDistributionFormatted: string
  langs: []
  runtime: string
  memory: string
  enableMemoryDistribution: string
  nonSufficientMsg: string
}

export type SuccessCheckReturnType = {
  status_code: number
  lang: string
  run_success: boolean
  status_runtime: string
  memory: number
  question_id: string
  elapsed_time: number
  compare_result: string
  code_output: string
  std_output: string
  last_testcase: string
  expected_output: string
  task_finish_time: number
  task_name: string
  finished: boolean
  state: 'SUCCESS'
  fast_submit: boolean
  total_correct: number
  total_testcases: number
  submission_id: string
  status_memory: string
  memory_percentile: number
  pretty_lang: string
} & (
  | {
      status_msg: 'Accepted'
      runtime_percentile: number
      memory_percentile: number
    }
  | {
      status_msg: 'Wrong Answer'
      runtime_percentile: null
      memory_percentile: null
      input_formatted: string
      input: string
    }
)

type CheckReturnType =
  | { state: 'STARTED' }
  | { state: 'PENDING' }
  | SuccessCheckReturnType

export type NotyArticleType = {
  summary: string
  uuid: string
  slug: string
  title: string
  articleType: 'QAQUESTION' | 'CIRCLE_ARTICLE' | 'SOLUTION' // "CIRCLE_ARTICLE": 文章；"SOLUTION"： 题解
  createdAt: string
  updatedAt: string
  thumbnail: string
  author: {
    userSlug: string
  }
  __typename: 'Article'
}
export type NotyLeetBookType = {
  summary: string
  slug: string
  image: string
  modifiedAt: string
  title: string
  __typename: 'LeetBook'
}
export type NotyBookPageType = {
  leetbook: {
    slug: string
    image: string
    summary: string
    __typename: string
  }
  title: string
  summary: string
  __typename: 'BookPage'
}
export type NotyItem = {
  nextToken: string
  rows: {
    feedContent: NotyArticleType | NotyLeetBookType | NotyBookPageType
    meta: { link: string }
  }[]
}

export type UserProfilePublicProfile = {
  profile: {
    userSlug: string
    realName: string
  }
} | null

export type QAQuestion = {
  ipRegion: string
  uuid: string
  slug: string
  title: string
  thumbnail: string
  summary: string
  content: string
  sunk: boolean
  pinned: boolean
  pinnedGlobally: boolean
  byLeetcode: boolean
  isRecommended: boolean
  isRecommendedGlobally: boolean
  subscribed: boolean
  hitCount: number
  numAnswers: number
  numPeopleInvolved: number
  numSubscribed: number
  createdAt: string
  updatedAt: null
  status: string
  identifier: string
  resourceType: string
  articleType: string
  alwaysShow: false
  alwaysExpand: false
  score: null
  favoriteCount: number
  isMyFavorite: false
  isAnonymous: false
  canEdit: false
  reactionType: null
  atQuestionTitleSlug: string
  reactionsV2: {
    count: number
    reactionType: string
    __typename: string
  }[]
  tags: {
    name: string
    nameTranslated: string
    slug: string
    imgUrl: null
    tagType: string
    __typename: string
  }[]
  subject: {
    slug: string
    title: string
    __typename: string
  }
  contentAuthor: {
    username: string
    userSlug: string
    realName: string
    avatar: string
    __typename: string
  }
  realAuthor: null
  __typename: string
} | null

export type SolutionArticle = {
  ipRegion: string
  rewardEnabled: null
  canEditReward: boolean
  uuid: string
  title: string
  slug: string
  sunk: boolean
  chargeType: string
  status: string
  identifier: string
  canEdit: boolean
  canSee: boolean
  reactionType: null
  hasVideo: boolean
  favoriteCount: number
  upvoteCount: number
  reactionsV2: {
    count: number
    reactionType: string
  }[]
  tags: {
    name: string
    nameTranslated: string
    slug: string
    tagType: string
  }[]
  createdAt: string
  thumbnail: string
  author: {
    username: string
    profile: {
      userAvatar: string
      userSlug: string
      realName: string
      reputation: number
    }
  }
  summary: string
  topic: {
    id: number
    commentCount: number
    viewCount: number
    pinned: boolean
  }
  byLeetcode: false
  isMyFavorite: false
  isMostPopular: false
  isEditorsPick: false
  hitCount: number
  videosInfo: []
} | null

export type CommunityArticle = {
  slug: string
  uuid: string
  title: string
  author: {
    username: string
    profile: {
      realName: string
      userSlug: string
      userAvatar: string
      __typename: string
    }
    __typename: string
  }
}

export type GlobalData = {
  userStatus: {
    isSignedIn: boolean
    isPremium: boolean
    username: string
    realName: string
    avatar: string
    userSlug: string
    isAdmin: boolean
    checkedInToday: boolean
    useTranslation: boolean
    premiumExpiredAt: number
    isTranslator: boolean
    isSuperuser: boolean
    isPhoneVerified: boolean
    isVerified: boolean
  }
  jobsMyCompany: {
    nameSlug: string
  } | null
  commonNojPermissionTypes: any[]
}

export type ProblemsetQuestion = {
  acRate: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  freqBar: number
  frontendQuestionId: string
  isFavor: boolean
  paidOnly: boolean
  solutionNum: number
  status: 'NOT_STARTED' | 'AC' | 'TRIED'
  title: string
  titleCn: string
  titleSlug: string
  topicTags: Array<{
    name: string
    nameTranslated: string
    id: string
    slug: string
  }>
  extra: Array<{
    companyTagNum: number
    hasVideoSolution: boolean
    topCompanyTags: {
      imgUrl: string
      slug: string
      numSubscribed: number
    }
  }>
}

export type ProblemsetQuestionList = {
  hasMore: boolean
  total: number
  questions: ProblemsetQuestion[]
  __typename: string
}

export type QuestionType = {
  translatedTitle: string
  title: string
  questionFrontendId: string
  titleSlug: string
  questionId: string
  categoryTitle: string
  isPaidOnly: boolean
  status: string
  difficulty: string
  __typename: string
}

export type Favorite = {
  idHash: string
  name: string
  id: string
  isPublicFavorite: boolean
  viewCount: number
  questions: {
    questionId: string
    title: string
    titleSlug: string
    __typename: string
  }[]
  topic_id: number
  __typename: string
}

export type FavoriteDetail = {
  description: string
  idHash: string
  name: string
  creator: {
    realName: string
    userAvatar: string
    userSlug: string
  }
  link: string
  isFavored: boolean
  coverUrl: string
  questionIds: number[]
  tags: {
    name: string
    nameTranslated: string
    slug: string
    tagType: string
  }[]
  __typename: string
}

export type AddFavoriteResult = {
  ok: boolean
  error: null | string
  name: string
  isPublicFavorite: boolean
  favoriteIdHash: string
  questionId: string
  __typename: string
}
export type RemoveFavoriteResult = {
  error: null | string
  favoriteIdHash: string
  ok: boolean
  questionId: string
}

export type ProblemsetPageProps = {
  featuredLists: Pick<
    FavoriteDetail,
    'coverUrl' | 'creator' | 'description' | 'idHash' | 'link' | 'name' | 'tags'
  >[]
}

export type CategorySlugType =
  | ''
  | 'algorithms'
  | 'database'
  | 'shell'
  | 'concurrency'
export type ProblemsetQuestionListFilterType = {
  listId?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  status?: 'NOT_STARTED' | 'AC' | 'TRIED'
  tags?: string[]
  premiumOnly?: boolean
  orderBy?:
    | 'FRONTEND_ID'
    | 'SOLUTION_NUM'
    | 'AC_RATE'
    | 'DIFFICULTY'
    | 'FREQUENCY'
  sortOrder?: 'DESCENDING' | 'ASCENDING'
  searchKeywords?: string
}

export type userProfileQuestion = {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  frontendId: `${number}`
  lastSubmissionSrc: null
  lastSubmittedAt: number
  numSubmitted: number
  title: string
  titleSlug: string
  translatedTitle: string
  __typename: 'ProgressQuestionNode'
}

export type QuestionStatus = 'ACCEPTED' | 'FAILED' | 'UNTOUCHED'

export type ContestInfo = {
  contest: {
    id: number
    title: string
    title_slug: string
    duration: number
    start_time: number
    is_virtual: boolean
    origin_start_time: number
    is_private: boolean
  }
  questions: Question[]
}

export type MyRanking = {
  my_submission: {
    [solvedId: string]: {
      contest_id: number
      data_region: string
      date: number
      fail_count: number
      id: number
      lang: string
      question_id: number
      status: number
      submission_id: number
    }
  }
  my_rank: {
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
  my_solved: number[]
  registered: boolean
}

export type ContestRanking = {
  attendedContestsCount: number
  globalRanking: number
  globalTotalParticipants: number
  localRanking: number
  localTotalParticipants: number
  rating: number
  topPercentage: number
}

export type Rating = {
  userContestRanking: ContestRanking
  userContestRankingHistory: {
    finishTimeInSeconds: number
    ranking: number
    rating: number
    score: number
    totalProblems: number
    trendingDirection: null
    attended: boolean
    contest: {
      startTime: number
      title: string
      titleCn: string
    }
  }[]
}

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
export type Question = {
  id: number
  question_id: number
  credit: number
  title: string
  english_title: string
  title_slug: string
  category_slug: string
}
export type RankingDataType = {
  is_past: boolean
  submissions: {
    [key: number]: SubmissionType
  }[]
  questions: Question[]
  total_rank: RankType[]
  user_num: number
}

class LeetCodeApi {
  public graphqlApi: (
    { method, body }: { endpoint?: string; method?: string; body?: unknown },
    retry?: number
  ) => Promise<any>
  public baseApi: (
    url: string,
    method?: string | undefined,
    body?: object | null | undefined,
    retry?: number | undefined
  ) => Promise<any>
  public REGION_URL: string

  public constructor(REGION_URL: string) {
    this.REGION_URL = REGION_URL
    this.graphqlApi = graphqlApi.bind(null, REGION_URL)
    this.baseApi = baseApi.bind(null, REGION_URL)
  }

  /** 获取所有题目
   *
   *  @param useCache 是否使用缓存，使用缓存的话，会将查询结果缓存到 LocalStorage 中，更新间隔为每个礼拜一，如果发现上次缓存是在礼拜一之前的话，就重新获取
   * TODO: 重新设计使用缓存时机
   * 通过判断当前官网拥有的题目总数量，来决定要不要更新
   * 通过判断官网最小的一题是否在缓存中，来决定是否要更新
   */
  public async getAllQuestions(useCache = true): Promise<QuestionType[]> {
    if (useCache) {
      const cache = localStorage.getItem('lc-extend:allQuestions')
      if (cache) {
        try {
          const res = JSON.parse(cache)
          if (res.update && new Date(res.update) > previousMonday(new Date())) {
            return res.questions
          }
        } catch (error) {
          console.log('解析缓存失败')
        }
      }
    }
    const body = {
      operationName: 'allQuestions',
      variables: {},
      query: /* GraphQL */ `
        query allQuestions {
          allQuestions {
            title
            titleSlug
            translatedTitle
            questionId
            questionFrontendId
            status
            difficulty
            isPaidOnly
            categoryTitle
            __typename
          }
        }
      `,
    }

    return this.graphqlApi({ body }).then(data => {
      const questions = data?.data?.allQuestions
      if (questions) {
        localStorage.setItem(
          'lc-extend:allQuestions',
          JSON.stringify({ questions: questions, update: new Date() })
        )
        return questions
      }
      throw new Error('获取题目列表失败,返回结果为: ' + JSON.stringify(data))
    })
  }

  /** 获取提交列表
   *
   */
  public async getSubmissions(
    questionSlug: string,
    limit = 40,
    offset = 0
  ): Promise<{
    lastKey: string
    hasNext: boolean
    submissions: {
      id: string
      statusDisplay: string
      lang: string
      runtime: string
      timestamp: string
      url: string
      isPending: string
      memory: string
      submissionComment: {
        comment: string
        flagType: string
        __typename: string
      }
      __typename: string
    }[]
    __typename: string
  }> {
    const body = {
      operationName: 'submissions',
      variables: {
        offset,
        limit,
        lastKey: null,
        questionSlug,
      },
      query: /* GraphQL */ `
        query submissions(
          $offset: Int!
          $limit: Int!
          $lastKey: String
          $questionSlug: String!
        ) {
          submissionList(
            offset: $offset
            limit: $limit
            lastKey: $lastKey
            questionSlug: $questionSlug
          ) {
            lastKey
            hasNext
            submissions {
              id
              statusDisplay
              lang
              runtime
              timestamp
              url
              isPending
              memory
              __typename
            }
            __typename
          }
        }
      `,
    }
    return this.graphqlApi({ body }).then(({ data }) => data.submissionList)
  }

  /** 获取提交详情
   *
   */
  private async getSubmissionDetailByLocal(submissionId: string): Promise<{
    id: string
    code: string
    runtime: string
    memory: string
    rawMemory: string
    statusDisplay: string
    timestamp: number
    lang: string
    passedTestCaseCnt: number
    totalTestCaseCnt: number
    sourceUrl: string
    question: {
      titleSlug: string
      title: string
      translatedTitle: string
      questionId: string
      __typename: string
    }
    outputDetail: {
      codeOutput: string
      expectedOutput: string
      input: string
      compileError: string
      runtimeError: string
      lastTestcase: string
      __typename: string
    }
    __typename: string
    submissionComment: null
  }> {
    const body = {
      operationName: 'mySubmissionDetail',
      variables: { id: submissionId },
      query: /* GraphQL */ `
        query mySubmissionDetail($id: ID!) {
          submissionDetail(submissionId: $id) {
            id
            code
            runtime
            memory
            rawMemory
            statusDisplay
            timestamp
            lang
            passedTestCaseCnt
            totalTestCaseCnt
            sourceUrl
            question {
              titleSlug
              title
              translatedTitle
              questionId
              __typename
            }
            ... on GeneralSubmissionNode {
              outputDetail {
                codeOutput
                expectedOutput
                input
                compileError
                runtimeError
                lastTestcase
                __typename
              }
              __typename
            }
            submissionComment {
              comment
              flagType
              __typename
            }
            __typename
          }
        }
      `,
    }

    return this.graphqlApi({ body }).then(({ data }) => data.submissionDetail)
  }

  /** 获取提交分布信息
   *
   */
  private async getDistributionLocal(submissionId: string): Promise<{
    runtimeDistribution: {
      lang: string
      distribution: [string, number][]
    } | null
    memoryDistribution: {
      lang: string
      distribution: [string, number][]
    } | null
  }> {
    const runtimeApi = `/submissions/api/runtime_distribution/${submissionId}/`
    const runtimeDistribution = await this.baseApi(runtimeApi)
      .then(res => res.json())
      .then(({ runtime_distribution_formatted }) =>
        runtime_distribution_formatted
          ? JSON.parse(runtime_distribution_formatted)
          : null
      )
    const memoryApi = `/submissions/api/memory_distribution/${submissionId}/`
    const memoryDistribution = await this.baseApi(memoryApi)
      .then(res => res.json())
      .then(({ memory_distribution_formatted }) =>
        memory_distribution_formatted
          ? JSON.parse(memory_distribution_formatted)
          : null
      )

    return { runtimeDistribution, memoryDistribution }
  }

  /** 获取提交详情（世界服）
   *
   */
  private async getSubmissionDetailByGlobal(
    submissionId: string
  ): Promise<GlobalSubmissionDetail> {
    const text = await fetch(
      `https://leetcode.com/submissions/detail/${submissionId}/`,
      {
        headers: {
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        },
        referrer: 'https://leetcode.com/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      }
    ).then(res => res.text())

    const dataText = text.match(/var pageData = ([\d\D]+?});/)?.[1]

    const data = eval(`(function (){return ${dataText}})()`)

    return data
  }

  /** 获取提交详情，根据当前 REGION_URL 确定是从国服还是世界服获取
   *
   */
  public async getSubmissionDetail(submissionId: string): Promise<{
    id: string // submissionId
    code: string // submissionCode
    runtime: string // runtime
    memory: string // submissionData.memory
    rawMemory: string // memory
    statusDisplay: string // status_code
    // timestamp: string
    lang: string // getLangDisplay
    passedTestCaseCnt: number // submissionData.total_correct
    totalTestCaseCnt: number // submissionData.total_testcases
    sourceUrl: string // editCodeUrl
    questionId: string
    runtimeDistribution?: { lang: string; distribution: [string, number][] }
    memoryDistribution?: { lang: string; distribution: [string, number][] }
  }> {
    if (/(leetcode-cn\.com)|(leetcode\.cn)/.test(this.REGION_URL)) {
      const data = await this.getSubmissionDetailByLocal(submissionId)
      const { runtimeDistribution, memoryDistribution } =
        await this.getDistributionLocal(submissionId)
      return {
        ...data,
        questionId: data.question.questionId,
        runtimeDistribution: runtimeDistribution
          ? runtimeDistribution
          : { lang: data.lang, distribution: [] },
        memoryDistribution: memoryDistribution
          ? memoryDistribution
          : {
              lang: data.lang,
              distribution: [],
            },
      }
    } else {
      const data = await this.getSubmissionDetailByGlobal(submissionId)
      return {
        id: data.submissionId,
        code: data.submissionCode,
        runtime: data.runtime,
        memory: data.submissionData.memory,
        rawMemory: data.memory,
        statusDisplay: globalGetStatusText(data.submissionData.status_code),
        lang: data.getLangDisplay,
        passedTestCaseCnt: Number(data.submissionData.total_correct),
        totalTestCaseCnt: Number(data.submissionData.total_testcases),
        sourceUrl: data.editCodeUrl,
        questionId: data.questionId,
        runtimeDistribution: JSON.parse(data.runtimeDistributionFormatted),
        memoryDistribution: JSON.parse(data.memoryDistributionFormatted),
      }
    }
  }

  /** 获取对应提交时间的详细代码（旧版）
   *
   */
  public getCodeByTime(
    lang: string,
    questionId: string,
    time: string
  ): Promise<string> {
    const api = `/submissions/api/detail/${questionId}/${lang}/${time}/`

    return this.baseApi(api)
      .then(res => res.json())
      .then(data => data.code)
  }

  /** 获取对应提交内存的详细代码（旧版）
   *
   */
  public getCodeByMemory(
    lang: string,
    questionId: string,
    memory: string
  ): Promise<string> {
    const api = `/submissions/api/detail/${questionId}/${lang}/memory/${memory}/`

    return this.baseApi(api)
      .then(res => res.json())
      .then(data => data.code)
  }

  /** 检查对应提交的状态
   *
   */
  public check(submissionId: string): Promise<CheckReturnType> {
    const api = `/submissions/detail/${submissionId}/check/`
    return this.baseApi(api).then(res => res.json())
  }

  /** 添加备注信息
   *
   */
  public submissionCreateOrUpdateSubmissionComment(
    submissionId: string,
    flagType: 'BLUE' | 'ORANGE' | 'GREEN' | 'PURPLE' | 'RED',
    comment: string
  ): Promise<{ ok: boolean; __typename: string }> {
    const body = {
      operationName: 'submissionCreateOrUpdateSubmissionComment',
      variables: {
        submissionId: submissionId,
        flagType: flagType,
        comment: comment,
      },
      query: /* GraphQL */ `
        mutation submissionCreateOrUpdateSubmissionComment(
          $submissionId: ID!
          $flagType: SubmissionFlagTypeEnum!
          $comment: String!
        ) {
          submissionCreateOrUpdateSubmissionComment(
            comment: $comment
            flagType: $flagType
            submissionId: $submissionId
          ) {
            ok
            __typename
          }
        }
      `,
    }

    return this.graphqlApi({ body }).then(
      ({ data }) => data.submissionCreateOrUpdateSubmissionComment
    )
  }

  /** 获取首页帖子列表
   *
   * @param nextToken 下一组帖子的 token,如果为空,则获取最新的一组帖子
   */
  public getNoty(nextToken = '', limit = 30): Promise<NotyItem> {
    const body = {
      operationName: 'myFeed',
      variables: { version: 1, nextToken, limit },
      query: /* GraphQL */ `
        query myFeed($nextToken: String, $limit: Int!, $version: Int) {
          myFeed(nextToken: $nextToken, limit: $limit, version: $version) {
            nextToken
            rows {
              tags {
                name
                slug
                tagType
                __typename
              }
              feedContent {
                ... on Article {
                  summary
                  uuid
                  slug
                  title
                  articleType
                  createdAt
                  updatedAt
                  thumbnail
                  author {
                    userSlug
                  }
                  __typename
                }
                ... on LeetBook {
                  summary
                  slug
                  image
                  modifiedAt
                  title
                  __typename
                }
                ... on BookPage {
                  leetbook {
                    slug
                    image
                    summary
                    __typename
                  }
                  title
                  summary
                  __typename
                }
                __typename
              }
              actor {
                userSlug
                avatar
                realName
                __typename
              }
              verb
              subscribed
              timestamp
              recommended
              questionInfo {
                title
                Slug
                __typename
              }
              meta {
                link
                __typename
              }
              __typename
            }
            __typename
          }
        }
      `,
    }
    return this.graphqlApi({ endpoint: 'graphql/noty', body }).then(
      ({ data }) => data.myFeed
    )
  }

  /** 获取用户信息
   *
   * @param slug 用户 slug
   */
  public getUserInfoBySlug(slug: string): Promise<UserProfilePublicProfile> {
    const body = {
      query: /* GraphQL */ `
        query userProfilePublicProfile($userSlug: String!) {
          userProfilePublicProfile(userSlug: $userSlug) {
            haveFollowed
            siteRanking
            profile {
              userSlug
              realName
              aboutMe
              asciiCode
              userAvatar
              gender
              websites
              skillTags
              globalLocation {
                country
                province
                city
              }
              socialAccounts {
                provider
                profileUrl
              }
              skillSet {
                langLevels {
                  langName
                  langVerboseName
                  level
                }
                topics {
                  slug
                  name
                  translatedName
                }
                topicAreaScores {
                  score
                  topicArea {
                    name
                    slug
                  }
                }
              }
            }
            educationRecordList {
              unverifiedOrganizationName
            }
            occupationRecordList {
              unverifiedOrganizationName
              jobTitle
            }
          }
        }
      `,
      variables: { userSlug: slug },
    }

    return this.graphqlApi({ body }).then(
      ({ data }) => data.userProfilePublicProfile
    )
  }

  /** 获取讨论帖信息
   *
   */
  public queryQAQuestionByUUID(uuid: string): Promise<QAQuestion> {
    const body = {
      operationName: 'qaQuestion',
      variables: {
        uuid,
      },
      query: /* GraphQL */ `
        query qaQuestion($uuid: ID!) {
          qaQuestion(uuid: $uuid) {
            ...qaQuestion
            __typename
          }
        }

        fragment qaQuestion on QAQuestionNode {
          ipRegion
          uuid
          slug
          title
          thumbnail
          summary
          content
          sunk
          pinned
          pinnedGlobally
          byLeetcode
          isRecommended
          isRecommendedGlobally
          subscribed
          hitCount
          numAnswers
          numPeopleInvolved
          numSubscribed
          createdAt
          updatedAt
          status
          identifier
          resourceType
          articleType
          alwaysShow
          alwaysExpand
          score
          favoriteCount
          isMyFavorite
          isAnonymous
          canEdit
          reactionType
          atQuestionTitleSlug
          reactionsV2 {
            count
            reactionType
            __typename
          }
          tags {
            name
            nameTranslated
            slug
            imgUrl
            tagType
            __typename
          }
          subject {
            slug
            title
            __typename
          }
          contentAuthor {
            ...contentAuthor
            __typename
          }
          realAuthor {
            ...realAuthor
            __typename
          }
          __typename
        }

        fragment contentAuthor on ArticleAuthor {
          username
          userSlug
          realName
          avatar
          __typename
        }

        fragment realAuthor on UserNode {
          username
          profile {
            userSlug
            realName
            userAvatar
            __typename
          }
          __typename
        }
      `,
    }

    return this.graphqlApi({ body }).then(({ data }) => data.qaQuestion)
  }

  /** 获取题解信息
   *
   */
  public querySolutionArticleBySlug(slug: string): Promise<SolutionArticle> {
    const body = {
      query: /* GraphQL */ `
        query solutionArticle($slug: String!) {
          solutionArticle(slug: $slug) {
            ipRegion
            rewardEnabled
            canEditReward
            uuid
            title
            slug
            sunk
            chargeType
            status
            identifier
            canEdit
            canSee
            reactionType
            hasVideo
            favoriteCount
            upvoteCount
            reactionsV2 {
              count
              reactionType
            }
            tags {
              name
              nameTranslated
              slug
              tagType
            }
            createdAt
            thumbnail
            author {
              username
              profile {
                userAvatar
                userSlug
                realName
                reputation
              }
            }
            summary
            topic {
              id
              commentCount
              viewCount
              pinned
            }
            byLeetcode
            isMyFavorite
            isMostPopular
            isEditorsPick
            hitCount
            videosInfo {
              videoId
              coverUrl
              duration
            }
          }
        }
      `,
      variables: {
        slug,
      },
    }
    return this.graphqlApi({ body }).then(({ data }) => data.solutionArticle)
  }
  /** 获取共享文章信息
   *
   */
  public queryCommunityArticleBySlug(slug: string): Promise<CommunityArticle> {
    const body = {
      operationName: 'columnsArticle',
      variables: {
        slug,
      },
      query: /* GraphQL */ `
        query columnsArticle($slug: String!) {
          columnsArticle(slug: $slug) {
            ...communityArticle
            __typename
          }
        }

        fragment communityArticle on ColumnArticleNode {
          slug
          uuid
          title
          hitCount
          pinnedGlobally
          pinned
          sunk
          createdAt
          updatedAt
          thumbnail
          identifier
          resourceType
          articleType
          score
          subject {
            title
            slug
            __typename
          }
          tags {
            name
            slug
            nameTranslated
            __typename
          }
          author {
            username
            profile {
              userSlug
              realName
              userAvatar
              __typename
            }
            __typename
          }
          reactionType
          reactionsV2 {
            count
            reactionType
            __typename
          }
          isMyFavorite
          topic {
            id
            commentCount
            __typename
          }
          summary
          isEditorsPick
          byLeetcode
          status
          favoriteCount
          __typename
        }
      `,
    }
    return this.graphqlApi({ body }).then(({ data }) => data.columnsArticle)
  }
  /** 获取共享文章信息
   *
   */
  public queryCommunityArticleById(id: string): Promise<CommunityArticle> {
    const body = {
      operationName: 'communityArticleDetail',
      variables: { id },
      query: /* GraphQL */ `
        query communityArticleDetail($id: ID!) {
          columnsArticleById(uuid: $id) {
            ...communityArticleDetail
            __typename
          }
        }

        fragment communityArticleDetail on ColumnArticleNode {
          ipRegion
          slug
          uuid
          title
          thumbnail
          content
          reactionType
          reactionsV2 {
            count
            reactionType
            __typename
          }
          hitCount
          createdAt
          updatedAt
          subscribed
          isMyFavorite
          identifier
          resourceType
          pinnedGlobally
          pinned
          sunk
          isEditorsPick
          byLeetcode
          articleType
          status
          summary
          author {
            username
            profile {
              realName
              userSlug
              userAvatar
              __typename
            }
            __typename
          }
          tags {
            name
            slug
            nameTranslated
            tagType
            __typename
          }
          subject {
            title
            slug
            __typename
          }
          topic {
            id
            lastComment {
              post {
                creationDate
                __typename
              }
              __typename
            }
            __typename
          }
          nextArticle {
            title
            uuid
            __typename
          }
          __typename
        }
      `,
    }
    return this.graphqlApi({ body }).then(({ data }) => data.columnsArticleById)
  }

  /** 获取全局状态
   *
   */
  public queryGlobalData(): Promise<GlobalData> {
    const body = {
      variables: {},
      query: /* GraphQL */ `
        query globalData {
          userStatus {
            isSignedIn
            isPremium
            username
            realName
            avatar
            userSlug
            isAdmin
            checkedInToday
            useTranslation
            premiumExpiredAt
            isTranslator
            isSuperuser
            isPhoneVerified
            isVerified
          }
          jobsMyCompany {
            nameSlug
          }
          commonNojPermissionTypes
        }
      `,
    }
    return this.graphqlApi({ body }).then(({ data }) => data)
  }

  /** 获取题单题目列表
   *
   */
  public async getProblemsetQuestionList({
    categorySlug = '',
    skip = 0,
    limit = 100,
    filters = {},
  }: {
    categorySlug?: CategorySlugType
    skip?: number
    limit?: number
    filters?: ProblemsetQuestionListFilterType
  } = {}): Promise<ProblemsetQuestionList> {
    const body = {
      operationName: 'problemsetQuestionList',
      query: /* GraphQL */ `
        query problemsetQuestionList(
          $categorySlug: String
          $limit: Int
          $skip: Int
          $filters: QuestionListFilterInput
        ) {
          problemsetQuestionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            hasMore
            total
            questions {
              acRate
              difficulty
              freqBar
              frontendQuestionId
              isFavor
              paidOnly
              solutionNum
              status
              title
              titleCn
              titleSlug
              topicTags {
                name
                nameTranslated
                id
                slug
              }
              extra {
                hasVideoSolution
                topCompanyTags {
                  imgUrl
                  slug
                  numSubscribed
                }
              }
            }
          }
        }
      `,
      variables: { categorySlug, skip, limit, filters },
    }
    return this.graphqlApi({ body }).then(
      ({ data }) => data.problemsetQuestionList
    )
  }

  /** 获取筛选过后的列表的所有题目
   *
   * // TODO: 如果获取的总数过大，一次请求有可能会造成超时，尝试分成多次请求
   */
  public async getProblemsetQuestionListAll(
    {
      categorySlug = '',
      filters = {},
    }: {
      categorySlug?: CategorySlugType
      filters?: ProblemsetQuestionListFilterType
    } = {},
    total?: number
  ): Promise<ProblemsetQuestion[]> {
    // 获取列表中题目的总数量
    if (total === undefined) {
      total = (
        await this.getProblemsetQuestionList({
          categorySlug,
          filters,
          skip: 0,
          limit: 1,
        })
      ).total
    }
    const n = Math.ceil(total / 100)
    const filterStr = JSON5.stringify(filters, { quote: '"' })

    const str = [...new Array(n).keys()].map(
      i => /* GraphQL */ `
      q${i}: problemsetQuestionList(
        categorySlug: "${categorySlug}", 
        limit: 100, 
        skip: ${i * 100}, 
        filters: ${filterStr}
      ) {
        ...questionFragment
      }`
    )

    const body = {
      operationName: 'problemsetQuestionList',
      query: /* GraphQL */ `
        query problemsetQuestionList {
          ${str}
        }
        fragment questionFragment on QuestionListNode {
          hasMore
          total
          questions {
            acRate
            difficulty
            freqBar
            frontendQuestionId
            isFavor
            paidOnly
            solutionNum
            status
            title
            titleCn
            titleSlug
            topicTags {
              name
              nameTranslated
              id
              slug
            }
            extra {
              hasVideoSolution
              topCompanyTags {
                imgUrl
                slug
                numSubscribed
              }
            }
          }
          __typename
        }
      `,
      variables: {},
    }
    const { data } = await this.graphqlApi({ body })
    const res: ProblemsetQuestion[] = []
    for (let i = 0; i < n; i++) {
      res.push(...data[`q${i}`].questions)
    }
    return res
  }

  /** 获取题单（收藏夹）列表，包括自己创建的和官方题单
   *
   */
  public getFavorites(): Promise<{
    allFavorites: Favorite[]
    officialFavorites: Favorite[]
  }> {
    const body = {
      operationName: 'allFavorites',
      variables: {},
      query: /* GraphQL */ `
        query allFavorites {
          favoritesLists {
            allFavorites {
              idHash
              name
              isPublicFavorite
              questions {
                questionId
                __typename
              }
              __typename
            }
            officialFavorites {
              idHash
              name
              questions {
                questionId
                __typename
              }
              __typename
            }
            __typename
          }
        }
      `,
    }
    return this.graphqlApi({ body }).then(({ data }) => data.favoritesLists)
  }

  /** 获取题单（收藏夹）列表，包括自己创建的和收藏的第三方题单
   *
   */
  public async getFavoriteMyFavorites(
    limit = 20,
    skip = 0
  ): Promise<FavoriteDetail[]> {
    const body = {
      operationName: 'favoriteMyFavorites',
      variables: { limit, skip },
      query: /* GraphQL */ `
        query favoriteMyFavorites($limit: Int, $skip: Int) {
          __typename
          favoriteMyFavorites(limit: $limit, skip: $skip) {
            hasMore
            total
            favorites {
              acNumber
              coverUrl
              created
              isPublicFavorite
              name
              link
              idHash
              questionNumber
              creator {
                realName
                userSlug
                __typename
              }
              __typename
            }
            __typename
          }
        }
      `,
    }
    const data = await this.graphqlApi({ body }).then(
      ({ data }) => data.favoriteMyFavorites
    )

    if (data.hasMore) {
      const next = await this.getFavoriteMyFavorites(20, limit + skip)
      data.favorites = data.favorites.concat(next)
    }
    return data.favorites
  }

  /** 获取题单（收藏夹）详细信息
   *
   */
  public async getFavoriteDetail(
    favoriteIdHashs: string[]
  ): Promise<FavoriteDetail[]> {
    const body = {
      query: /* GraphQL */ `
        query featuredListDetail {
          ${favoriteIdHashs.map(
            (favoriteIdHash, i) => /* GraphQL */ `
            favorite_${i}:favoriteDetail(favoriteIdHash:"${favoriteIdHash}" ) {
              description
              idHash
              name
              creator {
                realName
                userAvatar
                userSlug
              }
              link
              isFavored
              coverUrl
              questionIds
              tags {
                name
                nameTranslated
                slug
                tagType
              }
              __typename
            }`
          )}
          
        }
      `,
      operationName: 'featuredListDetail',
      variables: {},
    }

    const data = await this.graphqlApi({ body }).then(({ data }) => data)
    const res: FavoriteDetail[] = []
    for (let i = 0; i < favoriteIdHashs.length; i++) {
      res[i] = data[`favorite_${i}`]
    }
    return res
  }

  /** 添加题单（收藏夹）
   *
   */
  public async addFavorite(favoriteName: string): Promise<AddFavoriteResult> {
    const body = {
      operationName: 'addQuestionToNewFavorite',
      variables: {
        questionId: '1',
        isPublicFavorite: false,
        name: favoriteName,
      },
      query: /* GraphQL */ `
        mutation addQuestionToNewFavorite(
          $name: String!
          $isPublicFavorite: Boolean!
          $questionId: String!
        ) {
          addQuestionToNewFavorite(
            name: $name
            isPublicFavorite: $isPublicFavorite
            questionId: $questionId
          ) {
            ok
            error
            name
            isPublicFavorite
            favoriteIdHash
            questionId
            __typename
          }
        }
      `,
    }
    const res = (await this.graphqlApi({ body }).then(
      ({ data }) => data.addQuestionToNewFavorite
    )) as AddFavoriteResult
    if (!res.ok) {
      throw new Error(res.error!)
    }
    await this.deleteQuestionFromFavorite(res.favoriteIdHash, ['1'])
    return res
  }

  /** 删除除单（收藏夹）
   *
   */
  public async deleteFavorite(favoriteId: string): Promise<void> {
    await this.baseApi(`/list/api/${favoriteId}`, 'DELETE')
  }

  /** 删除对第三方除单（收藏夹）的收藏
   *
   */
  public async deleteThirdFavorite(
    favoriteId: string
  ): Promise<{ error: null | string; ok: boolean; __typename: string }> {
    const body = {
      operationName: 'favoriteRemoveFavoriteFromMyCollection',
      variables: { favoriteIdHash: favoriteId },
      query: /* GraphQL */ `
        mutation favoriteRemoveFavoriteFromMyCollection(
          $favoriteIdHash: String!
        ) {
          __typename
          favoriteRemoveFavoriteFromMyCollection(
            favoriteIdHash: $favoriteIdHash
          ) {
            error
            ok
            __typename
          }
        }
      `,
    }

    return this.graphqlApi({ body }).then(
      ({ data }) => data.favoriteRemoveFavoriteFromMyCollection
    )
  }

  /** 批量添加题目到题单（收藏夹）中
   *
   *  当一次性添加的熟练超过 100 以后，很大概率会 502，
   *  如果超过 100，通过分两次添加
   *
   */
  public async addQuestionToFavorite(
    favoriteId: string,
    questionIds: string[]
  ): Promise<{ questionId: string; __typename: string }[]> {
    if (questionIds.length > 200) {
      throw new Error('题单题目超出上限: 200')
    }
    if (questionIds.length > 100) {
      return (
        await this.addQuestionToFavorite(favoriteId, questionIds.slice(0, 100))
      ).concat(
        await this.addQuestionToFavorite(favoriteId, questionIds.slice(100))
      )
    }
    const body = {
      query: /* GraphQL */ `
      mutation addQuestionToFavorite {
        ${questionIds
          .map(
            (questionId, i) => /* GraphQL */ `
            add${i}: addQuestionToFavorite(
              favoriteIdHash: "${favoriteId}", 
              questionId: "${questionId}") {
                questionId
                __typename
              }`
          )
          .join('\n')}
      }`,
      operationName: 'addQuestionToFavorite',
      variables: {},
    }
    const { data } = await this.graphqlApi({ body })
    return questionIds.map((_, i) => data[`q${i}`])
  }

  /** 从题单（收藏夹）中的批量删除题目
   *
   */
  public async deleteQuestionFromFavorite(
    favoriteId: string,
    questionIds: string[]
  ): Promise<RemoveFavoriteResult[]> {
    const str = questionIds.map(
      (id, i) => /* GraphQL */ `
      q${i}:  removeQuestionFromFavorite(
          favoriteIdHash: "${favoriteId}"
          questionId: "${id}"
        ) {
          ok
          error
          favoriteIdHash
          questionId
        }`
    )
    const body = {
      query: /* GraphQL */ `
        mutation removeQuestionFromFavorite {
          ${str}
        }
      `,
      variables: {},
    }
    const res: RemoveFavoriteResult[] = []
    const { data } = await this.graphqlApi({ body })
    for (let i = 0; i < questionIds.length; i++) {
      res[i] = data[`q${i}`]
    }
    return res
  }

  /** 更新题单（收藏夹）信息
   *
   * 可以通过不传递 name 和 is_public_favorite 检测当前是否处于审核状态
   */
  public async setFavorite(data: {
    favorite_id_hash: string
    name?: string
    is_public_favorite?: boolean
  }): Promise<void> {
    await this.baseApi(`/list/api/`, 'PUT', data)
  }

  /** 获取 PageProps
   *
   * 其中包含 featuredLists（精选题单的列表）
   *
   */
  public getProblemsetPageProps(): Promise<ProblemsetPageProps> {
    return this.baseApi(
      `/_next/data/${
        (window as any).__NEXT_DATA__.buildId
      }/problemset/all.json?slug=all`
    )
      .then(res => res.json())
      .then(res => res.pageProps)
  }

  /** 查询当前用户题目的状态
   *
   */
  public async queryQuestionsStatus(
    skip = 0,
    limit = 100,
    status: QuestionStatus = 'ACCEPTED',
    sortField:
      | 'LAST_SUBMITTED_AT'
      | 'QUESTION_FRONTEND_ID'
      | 'NUM_SUBMITTED' = 'LAST_SUBMITTED_AT',
    sortOrder: 'ASCENDING' | 'DESCENDING' = 'DESCENDING',
    difficulty: ('EASY' | 'MEDIUM' | 'HARD')[] = []
  ): Promise<{ questions: userProfileQuestion[]; totalNum: number }> {
    const body = {
      operationName: 'userProfileQuestions',
      variables: {
        status,
        skip,
        first: limit,
        sortField,
        sortOrder,
        difficulty,
      },
      query: /* GraphQL */ `
        query userProfileQuestions(
          $status: StatusFilterEnum!
          $skip: Int!
          $first: Int!
          $sortField: SortFieldEnum!
          $sortOrder: SortingOrderEnum!
          $keyword: String
          $difficulty: [DifficultyEnum!]
        ) {
          userProfileQuestions(
            status: $status
            skip: $skip
            first: $first
            sortField: $sortField
            sortOrder: $sortOrder
            keyword: $keyword
            difficulty: $difficulty
          ) {
            totalNum
            questions {
              translatedTitle
              frontendId
              titleSlug
              title
              difficulty
              lastSubmittedAt
              numSubmitted
              lastSubmissionSrc {
                sourceType
                ... on SubmissionSrcLeetbookNode {
                  slug
                  title
                  pageId
                  __typename
                }
                __typename
              }
              __typename
            }
            __typename
          }
        }
      `,
    }
    return this.graphqlApi({ body }).then(
      ({ data }) => data.userProfileQuestions
    )
  }

  /** 查询最近某种状态的题目
   *
   */
  public async queryACQuestions(
    last: Date,
    status: QuestionStatus = 'ACCEPTED',
    skip = 0,
    limit = 100
  ): Promise<userProfileQuestion[]> {
    const compare = (q: userProfileQuestion) =>
      q.lastSubmittedAt * 1000 >= last.valueOf()
    const { questions, totalNum } = await this.queryQuestionsStatus(
      skip,
      limit,
      status
    )
    if (!questions.length) return []
    if (!compare(questions.at(-1)!)) {
      // 因为是按照提交日期排序的，并且当前拿到的最后一个元素已经是在指定日期之前的，
      // 那后面就肯定没有满足要求的提交，可以不用在继续请求，直接返回当前满足条件的题目提交
      return questions.filter(compare)
    }
    if (skip + limit >= totalNum) {
      // 已经没有更多提交了
      return questions
    }
    return questions.concat(
      await this.queryACQuestions(last, status, skip + limit, limit)
    )
  }

  public async getContestInfo(contestSlug: string): Promise<ContestInfo> {
    return this.baseApi(`/contest/api/info/${contestSlug}/`).then(res =>
      res.json()
    )
  }
  public async getGlobalyRanking(contestSlug: string): Promise<MyRanking> {
    return this.baseApi(
      `/contest/api/myranking/${contestSlug}/?region=global`
    ).then(res => res.json())
  }
  public async getContest(
    contestSlug: string,
    page: number,
    region: 'local' | 'global' = 'local'
  ): Promise<RankingDataType> {
    return this.baseApi(
      `/contest/api/ranking/${contestSlug}/?pagination=${page}&region=${region}`
    ).then(res => res.json())
  }

  public getRating(
    userSlug: string,
    hasHistory?: false
  ): Promise<{ userContestRanking: ContestRanking }>
  public getRating(userSlug: string, hasHistory: true): Promise<Rating>
  public getRating(userSlug: string, hasHistory?: boolean): Promise<Rating> {
    const body = {
      variables: { userSlug },
      query: /* GraphQL */ `
        query userContestRankingInfo($userSlug: String!) {
          userContestRanking(userSlug: $userSlug) {
            attendedContestsCount
            rating
            globalRanking
            localRanking
            globalTotalParticipants
            localTotalParticipants
            topPercentage
          }
          ${
            hasHistory
              ? /* GraphQL */ `
          userContestRankingHistory(userSlug: $userSlug) {
            attended
            totalProblems
            trendingDirection
            finishTimeInSeconds
            rating
            score
            ranking
            contest {
              title
              titleCn
              startTime
            }
          }`
              : ''
          }
        }
      `,
    }
    return this.graphqlApi({ endpoint: 'graphql/noj-go/', body }).then(
      ({ data }) => data
    )
  }
}

export { LeetCodeApi }
