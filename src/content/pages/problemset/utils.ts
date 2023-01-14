export type OrderBy =
  | 'FRONTEND_ID'
  | 'SOLUTION_NUM'
  | 'AC_RATE'
  | 'DIFFICULTY'
  | 'FREQUENCY'
  | 'RANKING'

export const SORT_KEY: { key: OrderBy; title: string }[] = [
  { key: 'FRONTEND_ID', title: '题目' },
  { key: 'SOLUTION_NUM', title: '题解' },
  { key: 'AC_RATE', title: '通过率' },
  { key: 'DIFFICULTY', title: '难度' },
  { key: 'FREQUENCY', title: '出现频率' },
]

export type CustomFilter = {
  sort?: { sortOrder: 'DESCENDING' | 'ASCENDING'; orderBy: OrderBy }
  min?: string
  max?: string
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
  custom?: CustomFilter
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
