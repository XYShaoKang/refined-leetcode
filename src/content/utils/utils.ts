import { DefaultTheme } from 'styled-components/macro'
import { darkTheme, lightTheme } from '@/theme'
import { debounce } from 'src/utils'
import { PageName } from 'src/options/options'

export function download(str: string, filename = 'contest.md'): void {
  const blob = new Blob([str], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
}

/** 等待匹配函数成功，或者超时
 *
 * @param fn 判断是否成功的函数
 * @param timeout 超时，时间 ms（毫秒）
 * @param delay 延时时间，时间 ms（毫秒）
 */
export function awaitFn(
  fn: (...args: any) => boolean | Promise<boolean>,
  timeout = 10000,
  delay = 100
): Promise<void> {
  const start = new Date().valueOf()
  return new Promise<void>(function (resolve, reject) {
    const timer = setInterval(async () => {
      if (await fn()) {
        clearInterval(timer)
        resolve()
      } else {
        if (new Date().valueOf() - start > timeout) {
          clearInterval(timer)
          reject('超时')
        }
      }
    }, delay)
  })
}

async function findBase<T>(
  find: () => any,
  fn: (el: T) => boolean,
  time = 10000,
  delay = 100
): Promise<T> {
  let element: T
  await awaitFn(
    () => {
      element = find()
      return fn(element)
    },
    time,
    delay
  )
  return element!
}

/** 查找匹配选择器的所有元素
 *
 * 返回一个 Promise,当找到任何与选择器匹配的元素时,则 resolve 一个包含所有与选择器匹配元素的数组;如果在超时时间内未找到与选择器匹配的元素时,则 Promise 会被拒绝.
 * @param selectors 需要匹配的选择器
 * @param fn 判断是否找到元素的函数
 * @param timeout 超时设置,默认为 10000
 * @returns 返回找到的所有元素
 */
export async function findAllElement<T = HTMLElement>(
  selectors: string,
  fn = (e: T[]) => e.length > 0,
  timeout = 10000
): Promise<T[]> {
  const elements = await findBase<T[]>(
    () => Array.from(document.querySelectorAll(selectors)),
    fn,
    timeout
  )
  return elements
}

/** 查找匹配选择器的第一个元素
 * 返回一个 Promise,当找到第一个与选择器匹配的元素时,则 resolve 找到的这个元素;如果在超时时间内未找到与选择器匹配的元素时,则 Promise 会被拒绝.
 * @param selectors 需要匹配的选择器
 * @param fn 判断是否找到元素的函数
 * @param timeout 超时设置,默认为 10000
 * @returns 返回找到的元素
 */
export async function findElement<T = HTMLElement>(
  selectors: string,
  fn = (el: T | null) => !!el,
  timeout = 10000
): Promise<T> {
  const element = await findBase<T>(
    () => document.querySelector(selectors),
    fn,
    timeout
  )
  return element
}

// https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate
type NodeType =
  | 'ANY_TYPE'
  | 'NUMBER_TYPE'
  | 'STRING_TYPE'
  | 'BOOLEAN_TYPE'
  | 'UNORDERED_NODE_ITERATOR_TYPE'
  | 'ORDERED_NODE_ITERATOR_TYPE'
  | 'UNORDERED_NODE_SNAPSHOT_TYPE'
  | 'ORDERED_NODE_SNAPSHOT_TYPE'
  | 'ANY_UNORDERED_NODE_TYPE'
  | 'FIRST_ORDERED_NODE_TYPE'

/** 通过 XPath 查找元素
 * 返回一个 Promise,当找与 XPath 匹配的元素时,返回找到的这个元素;如果在超时时间内未找到与选择器匹配的元素时,则 Promise 会被拒绝.
 * @param xpath 需要匹配的 XPath
 * @param fn 判断是否找到元素的函数
 * @param timeout 超时设置,默认为 10000
 * @returns 返回找到的元素
 */
export function findElementByXPath<T = HTMLElement>(
  evaluateParam: string,
  fn?: (el: T | null) => boolean,
  timeout?: number
): Promise<T>
export async function findElementByXPath<T = HTMLElement>(
  evaluateParam: {
    xpath: string
    nodeType: 'ANY_UNORDERED_NODE_TYPE' | 'FIRST_ORDERED_NODE_TYPE'
  },
  fn?: (el: T) => boolean,
  timeout?: number
): Promise<T>
export async function findElementByXPath<T = XPathResult>(
  evaluateParam: {
    xpath: string
    nodeType: 'ANY_TYPE'
  },
  fn?: (el: T) => boolean,
  timeout?: number
): Promise<T>
export async function findElementByXPath<T = number>(
  evaluateParam: {
    xpath: string
    nodeType: 'NUMBER_TYPE'
  },
  fn?: (el: T) => boolean,
  timeout?: number
): Promise<T>
export async function findElementByXPath<T = string>(
  evaluateParam: {
    xpath: string
    nodeType: 'STRING_TYPE'
  },
  fn?: (el: T) => boolean,
  timeout?: number
): Promise<T>
export async function findElementByXPath<T = boolean>(
  evaluateParam: {
    xpath: string
    nodeType: 'BOOLEAN_TYPE'
  },
  fn?: (el: T) => boolean,
  timeout?: number
): Promise<T>
export async function findElementByXPath<T = HTMLElement[]>(
  evaluateParam: { xpath: string; nodeType: NodeType },
  fn?: (el: T) => boolean,
  timeout?: number
): Promise<T>
export async function findElementByXPath<T = HTMLElement | HTMLElement[]>(
  evaluateParam: string | { xpath: string; nodeType: NodeType },
  fn?: (el: T) => boolean,
  timeout = 10000
): Promise<T> {
  let xpath: string,
    nodeType: NodeType = 'FIRST_ORDERED_NODE_TYPE'
  if (typeof evaluateParam === 'string') {
    xpath = evaluateParam
  } else {
    xpath = evaluateParam.xpath
    nodeType = evaluateParam.nodeType ?? 'ANY_TYPE'
  }
  if (!fn) {
    if (
      nodeType === 'UNORDERED_NODE_ITERATOR_TYPE' ||
      nodeType === 'ORDERED_NODE_ITERATOR_TYPE' ||
      nodeType === 'ORDERED_NODE_SNAPSHOT_TYPE' ||
      nodeType === 'UNORDERED_NODE_SNAPSHOT_TYPE'
    ) {
      fn = el => !!(Array.isArray(el) && el.length)
    } else {
      fn = (el: T | null) => el !== null && el !== undefined
    }
  }
  const element = await findBase<T>(
    () => {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult[nodeType],
        null
      )
      if (
        nodeType === 'FIRST_ORDERED_NODE_TYPE' ||
        nodeType === 'ANY_UNORDERED_NODE_TYPE'
      ) {
        return result.singleNodeValue
      }
      if (nodeType === 'ANY_TYPE') {
        return result
      }
      if (nodeType === 'NUMBER_TYPE') {
        return result.numberValue
      }
      if (nodeType === 'STRING_TYPE') {
        return result.stringValue
      }
      if (nodeType === 'BOOLEAN_TYPE') {
        return result.booleanValue
      }

      const res: any[] = []
      if (
        nodeType === 'UNORDERED_NODE_ITERATOR_TYPE' ||
        nodeType === 'ORDERED_NODE_ITERATOR_TYPE'
      ) {
        let it = result.iterateNext()
        while (it) {
          res.push(it)
          it = result.iterateNext()
        }
      } else if (
        nodeType === 'ORDERED_NODE_SNAPSHOT_TYPE' ||
        nodeType === 'UNORDERED_NODE_SNAPSHOT_TYPE'
      ) {
        for (let i = 0; i < result.snapshotLength; i++) {
          res.push(result.snapshotItem(i))
        }
      }

      return res
    },
    fn,
    timeout
  )
  return element
}

/** 添加监听 url 变化的事件
 *
 */
export const initUrlChangeEvent = (() => {
  let isLoad = false
  const load = () => {
    if (isLoad) return
    isLoad = true

    const oldPushState = history.pushState
    const oldReplaceState = history.replaceState
    let preUrl: string | undefined = undefined
    const onChange = debounce(() => {
      const url = location.href
      if (url !== preUrl) {
        preUrl = url
        window.dispatchEvent(new Event('urlchange'))
      }
    }, 100)
    history.pushState = function pushState(...args) {
      const res = oldPushState.apply(this, args)
      onChange()
      return res
    }

    history.replaceState = function replaceState(...args) {
      const res = oldReplaceState.apply(this, args)
      onChange()
      return res
    }

    window.addEventListener('popstate', () => {
      window.dispatchEvent(new Event('urlchange'))
    })
  }
  return load
})()

/** 获取当前力扣的主题
 *
 */
export const getTheme = (): DefaultTheme => {
  const lcDarkDide = localStorage.getItem('lc-dark-side')
  if (lcDarkDide === 'dark') {
    return darkTheme
  }
  return lightTheme
}

export const IS_MAC =
  navigator.platform.indexOf('Mac') === 0 || navigator.platform === 'iPhone'

export function isObject(obj: unknown): obj is object {
  return typeof obj === 'object' && obj !== null
}

/** 延时函数
 *
 *
 * @param time 时间
 * @returns
 */
export function sleep(time: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

export function getExtensionId(): string | undefined {
  const extensionId =
    document.getElementById('refined-leetcode')?.dataset.extensionid
  return extensionId
}

/** 判断当前是否使用新版 UI
 *
 */
export const isBetaUI: () => Promise<boolean> = (() => {
  let beta: boolean | null = null,
    promise: Promise<HTMLElement> | null = null
  return async function isBetaUI() {
    if (beta !== null) return beta
    if (!promise) {
      promise = Promise.race([
        findElement('#__next'), // 新版 UI
        findElement('#app'), // 旧版 UI
        findElement('body.pc-body'), // 祖传 UI
      ])
    }

    const root = await promise
    beta = root.id === '__next'
    return beta
  }
})()

export interface ProblemRankData {
  Rating: number
  ID: number // questionFrontendId
  Title: string
  TitleZH: string
  TitleSlug: string
  ContestSlug: string
  ProblemIndex: string
  ContestID_en: string
  ContestID_zh: string
}

export const getProblemRankData = async (): Promise<ProblemRankData[]> => {
  const dataUrls = [
    'https://raw.githubusercontent.com/zerotrac/leetcode_problem_rating/main/data.json',
    'https://cdn.jsdelivr.net/gh/zerotrac/leetcode_problem_rating/data.json',
    'https://testingcf.jsdelivr.net/gh/zerotrac/leetcode_problem_rating/data.json',
    'https://fastly.jsdelivr.net/gh/zerotrac/leetcode_problem_rating/data.json',
    'https://gcore.jsdelivr.net/gh/zerotrac/leetcode_problem_rating/data.json',
  ]
  const data = await Promise.race(
    dataUrls.map(url =>
      fetch(url)
        .then(res => res.json())
        .catch(() => new Promise((res, rej) => setTimeout(rej, 10000)))
    )
  )

  return data
}

export type PreviousRatingDataType = {
  info: {}
  totalRank: {
    username: string
    data_region: string
    rating: number
    acc: number
    score: number
    finish_time: number
    fail_count?: number
  }[]
  rankUpdate?: number
  update?: number
}

export const getPreviousRatingData = async (
  contestSlug: string
): Promise<PreviousRatingDataType> => {
  const dataUrls = [
    `https://leetcode-predictor.oss-cn-beijing.aliyuncs.com/data/${contestSlug}.json`,
  ]
  try {
    const { sha } = await getGitHubCommit(
      'XYShaoKang',
      'leetcode-predictor',
      'master'
    )
    dataUrls.push(
      `https://raw.githubusercontent.com/XYShaoKang/leetcode-predictor/${sha}/data/${contestSlug}.json`,
      `https://cdn.jsdelivr.net/gh/XYShaoKang/leetcode-predictor@${sha}/data/${contestSlug}.json`
    )
  } catch (error) {
    //
  }

  try {
    const data = await Promise.race(
      dataUrls.map(url =>
        fetch(url)
          .then(res => res.json())
          .catch(() => new Promise((res, rej) => setTimeout(rej, 10000)))
      )
    )
    if (data) return data
    throw new Error('获取数据错误')
  } catch (error) {
    //
  }
  throw new Error('获取数据错误')
}

type GitHubCommit = {
  url: string
  sha: string
  node_id: string
  html_url: string
  comments_url: string
  commit: {
    url: string
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
    tree: {
      url: string
      sha: string
    }
    comment_count: number
    verification: {
      verified: boolean
      reason: string
      signature: null
      payload: null
    }
  }
  author: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  committer: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: false
  }
  parents: [
    {
      url: string
      sha: string
    }
  ]
  stats: {
    additions: number
    deletions: number
    total: number
  }
  files: [
    {
      filename: string
      additions: number
      deletions: number
      changes: number
      status: string
      raw_url: string
      blob_url: string
      patch: string
    }
  ]
}

export const getGitHubCommit = async (
  owner: string,
  repo: string,
  ref: string
): Promise<GitHubCommit> => {
  const res: any = await Promise.race([
    fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${ref}`, {
      cache: 'no-cache',
      credentials: 'omit',
    }),
    new Promise((res, rej) => setTimeout(rej, 1000)),
  ])
  const result = await res.json()
  if (res.status === 403) {
    throw new Error(result.message)
  }

  return result
}

// 通过页面包含的一些独特特征判断是否已经跳转到某个页面
export const problemsetPageIsLoad = async (): Promise<boolean> => {
  const el = await findElementByXPath(`//li[text()="Problems"]`)
  const hr = el.parentElement?.nextElementSibling
  if (!hr) return false
  return getComputedStyle(hr)['visibility'] === 'visible'
}

export function routerTo(url: string, shallow = true): void {
  const next = (window as any).next
  if (!next) return
  next.router.push(url, undefined, { shallow })
}

export function setRef<T>(el: T, ref?: React.Ref<T>): void {
  if (ref) {
    if (typeof ref === 'function') {
      ref(el)
    } else if ('current' in ref) {
      ;(ref as React.MutableRefObject<T>).current = el
    }
  }
}

export function autoMount(
  xpath: string,
  mount: (...args: any) => void | Promise<void>,
  findAncestor: (el: HTMLElement[]) => HTMLElement | null | undefined,
  unmount?: (...args: any) => void | Promise<void>,
  defaultAncestor: HTMLElement = document.body
): [mount: () => Promise<void>, unmount: () => void] {
  let _observer: MutationObserver | null = null
  return [
    async function run(): Promise<void> {
      const els = await findElementByXPath({
        xpath,
        nodeType: 'UNORDERED_NODE_ITERATOR_TYPE',
      })
      const ancestor = findAncestor(els) ?? defaultAncestor

      const mountFn = debounce(async () => {
        await unmount?.()
        if (!_observer) return
        mount()
      }, 100)
      mountFn()
      _observer?.disconnect()
      _observer = new MutationObserver(mountFn)
      if (ancestor)
        _observer.observe(ancestor, { childList: true, subtree: true })
    },
    () => {
      _observer?.disconnect()
      _observer = null
      unmount?.()
    },
  ]
}

export const customEventDispatch: CustomEventDispatch = (eventName, data?) => {
  const event = new CustomEvent(eventName, { detail: data })
  window.dispatchEvent(event)
}

export function getPageName(): PageName | undefined {
  if (location.pathname === '/') {
    // 首页
    return 'homePage'
  }
  const paths = location.pathname.split('/').filter(Boolean)
  if (paths[0] === 'problem-list') {
    // 题单页
    return 'problemListPage'
  } else if (paths[0] === 'problems') {
    if (paths[2] === 'solutions' && paths[3]) {
      // 新版题解 solutions
      // 旧版题解 solution
      return 'solutionsPage'
    }
    // 答题页
    return 'problemsPage'
  } else if (paths[0] === 'contest') {
    if (paths[2] === 'problems') {
      // 比赛答题页
      return 'contestProblemsPage'
    } else if (paths[2] === 'ranking') {
      // 比赛排名页
      return 'contestRankingPage'
    }
  } else if (paths[0] === 'problemset') {
    // 题库页
    return 'problemsetPage'
  }
}

export function gkey(region: string, username: string): string {
  return `${region.toLocaleLowerCase()}:${username.toLocaleLowerCase()}`
}
