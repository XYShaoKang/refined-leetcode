import { previousMonday } from 'date-fns/fp'
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

export function graphqlApi(
  REGION_URL: string,
  {
    endpoint,
    method,
    body,
  }: { endpoint?: string; method?: string; body?: unknown },
  retry = 1
): Promise<unknown> {
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
    if (res.status === 200) {
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

  if (method === 'GET') {
    bodyStr = null
  } else {
    bodyStr = isObject(body) ? JSON.stringify(body) : body
  }

  return fetch(REGION_URL + url, {
    headers: {
      accept: 'application/json, text/plain, */*',
    },
    referrer: `REGION_URL`,
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: bodyStr,
    method,
    mode: 'cors',
    credentials: 'include',
  }).then(res => {
    if (res.status === 200) {
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
        baseApi(REGION_URL, url, method, body, retry + 1)
      )
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
  hasMore: boolean
  total: number
  questions: Array<{
    acRate: number
    difficulty: string
    freqBar: number
    frontendQuestionId: string
    isFavor: boolean
    paidOnly: boolean
    solutionNum: number
    status: string
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
  }>
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
    const runtimeDistribution = await this.baseApi(runtimeApi).then(
      ({ runtime_distribution_formatted }) =>
        runtime_distribution_formatted
          ? JSON.parse(runtime_distribution_formatted)
          : null
    )
    const memoryApi = `/submissions/api/memory_distribution/${submissionId}/`
    const memoryDistribution = await this.baseApi(memoryApi).then(
      ({ memory_distribution_formatted }) =>
        memory_distribution_formatted
          ? JSON.parse(memory_distribution_formatted)
          : null
    )

    return { runtimeDistribution, memoryDistribution }
  }

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

  public getCodeByTime(
    lang: string,
    questionId: string,
    time: string
  ): Promise<string> {
    const api = `/submissions/api/detail/${questionId}/${lang}/${time}/`

    return this.baseApi(api).then(data => data.code)
  }

  public getCodeByMemory(
    lang: string,
    questionId: string,
    memory: string
  ): Promise<string> {
    const api = `/submissions/api/detail/${questionId}/${lang}/memory/${memory}/`

    return this.baseApi(api).then(data => data.code)
  }

  public check(submissionId: string): Promise<CheckReturnType> {
    const api = `/submissions/detail/${submissionId}/check/`
    return this.baseApi(api)
  }

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
  public getProblemsetQuestionList(
    listId: string,
    limit = 100,
    skip = 0
  ): Promise<ProblemsetQuestion['questions']> {
    const body = {
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
      variables: {
        categorySlug: '',
        skip,
        limit,
        filters: { listId },
      },
    }
    return this.graphqlApi({ body }).then(
      ({ data }) => data.problemsetQuestionList.questions
    )
  }
}

export { LeetCodeApi }
