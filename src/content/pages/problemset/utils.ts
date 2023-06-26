import { CategorySlugType, ProblemsetQuestionListFilterType } from '@/utils'
import { Option } from './questionsSlice'

export type OrderBy =
  | 'STATUS'
  | 'FRONTEND_ID'
  | 'SOLUTION_NUM'
  | 'AC_RATE'
  | 'DIFFICULTY'
  | 'FREQUENCY'
  | 'RANKING'

export const SORT_KEY: { key: OrderBy; title: string }[] = [
  { key: 'STATUS', title: 'Status' },
  { key: 'FRONTEND_ID', title: 'Title' },
  { key: 'SOLUTION_NUM', title: 'Solution' },
  { key: 'AC_RATE', title: 'Acceptance' },
  { key: 'DIFFICULTY', title: 'Difficulty' },
  { key: 'FREQUENCY', title: 'Frequency' },
]

export type CustomFilter = {
  sort?: { sortOrder: 'DESCENDING' | 'ASCENDING'; orderBy: OrderBy }
  min?: string // 评分最小值
  max?: string // 评分最大值
  includePremium?: boolean // 是否包含会员题，默认包含会员题
}
export interface ParamType {
  sorting?: [
    {
      sortOrder: 'DESCENDING' | 'ASCENDING' | number
      orderBy: OrderBy
    }
  ] // 排序字段
  topicSlugs?: string[] // 标签
  page?: number // 当前页数
  status?: 'NOT_STARTED' | 'AC' | 'TRIED' // 状态：
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' // 难度
  listId?: string // 题单
  custom?: CustomFilter // 自定义参数
}

const map = {
  sorting: (s: string) => JSON.parse(window.atob(s)),
  topicSlugs: (s: string) => s.split(','),
  page: (s: string) => Number(s),
  status: (s: string) => s,
  difficulty: (s: string) => s,
  listId: (s: string) => s,
  custom: (s: string) => JSON.parse(window.atob(s)),
  search: (s: string) => s,
}

/** 解析 url 参数
 *
 */
export function parseParams(): ParamType {
  const search = new URLSearchParams(location.search)
  const params: ParamType = {}
  for (const arr of search) {
    const [key, value] = arr as [keyof ParamType, string]
    if (map[key]) params[key] = map[key](value) as any
  }
  return params
}

export function parseParamsToBody(): Option {
  const search = new URLSearchParams(location.search)
  const body: Option = { categorySlug: '', filters: {} }
  const paths = location.pathname.split('/').filter(Boolean)
  if (paths[0] === 'problemset' && paths[1] !== 'all') {
    body.categorySlug = paths[1] as CategorySlugType
  } else if (paths[0] === 'problem-list') {
    body.filters!.listId = paths[1]
  }
  if (search.has('page')) {
    const page = Number(search.get('page'))
    if (!isNaN(page)) {
      const itemsPerPage = Number(
        localStorage.getItem('problem-list:itemsPerPage') ?? '50'
      )
      body.limit = itemsPerPage
      body.skip = itemsPerPage * (page - 1)
    }
  }
  if (body.filters) {
    if (search.has('custom')) {
      body.filters.custom = map.custom(search.get('custom')!)
    } else if (search.has('sorting')) {
      const [{ orderBy, sortOrder }] = map.sorting(search.get('sorting')!)
      if (orderBy) {
        body.filters = { ...body.filters, orderBy, sortOrder }
      }
    }
    if (search.has('search')) {
      body.filters.searchKeywords = search.get('search')!
    }
    if (search.has('topicSlugs')) {
      body.filters.tags = search.get('topicSlugs')!.split(',')
    }
    type KeyType = keyof ProblemsetQuestionListFilterType
    for (const key of ['listId', 'difficulty', 'status'] as KeyType[]) {
      if (search.has(key)) body.filters[key] = search.get(key)! as any
    }
  }

  return body
}

/** 将参数序列化为字符串
 *
 */
export function serializationPrams(params: ParamType): string {
  const search = new URLSearchParams()
  for (const key of Object.keys(params).sort() as (keyof ParamType)[]) {
    if (!params[key]) continue
    if (key === 'sorting' || key === 'custom') {
      search.append(
        key,
        window.btoa(
          JSON.stringify(params[key], [
            'sortOrder',
            'orderBy',
            'id',
            'sort',
            'min',
            'max',
            'includePremium',
          ])
        )
      )
    } else {
      search.append(key, params[key]!.toString())
    }
  }
  return search.toString()
}

const idKey = 'refined-leetcode-sorting-id'

/** 获取 Id
 *
 * @param add 是否需要自增
 * @returns
 */
export function getId(add = false): number {
  let text = localStorage.getItem(idKey)
  if (!text) text = '1'
  let res = Number(text)
  if (isNaN(res)) {
    res = 1
    localStorage.setItem(idKey, '1')
  } else if (add) {
    res++
    if (res > 1000) res = 1
    localStorage.setItem(idKey, res.toString())
  }
  return res
}

export function once(name: string): Promise<any> {
  return new Promise(r => {
    window.addEventListener(name, r, { once: true })
  })
}
