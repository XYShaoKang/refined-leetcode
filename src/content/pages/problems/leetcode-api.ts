import { baseApi, globalGetStatusText, graphqlApi } from './utils'

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

class LeetCodeApi {
  public graphqlApi: (
    { method, body }: { method?: string; body?: unknown },
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

  public async getAllQuestions(): Promise<
    {
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
    }[]
  > {
    const cache = localStorage.getItem('lc-extend:allQuestions')
    if (cache) {
      try {
        const res = JSON.parse(cache)
        return res
      } catch (error) {
        console.log('解析缓存失败')
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
      const res = data?.data?.allQuestions
      if (res) {
        localStorage.setItem('lc-extend:allQuestions', JSON.stringify(res))
        return res
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
}

export { LeetCodeApi }
