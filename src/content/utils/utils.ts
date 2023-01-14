import { DefaultTheme } from 'styled-components/macro'
import { darkTheme, lightTheme } from '@/theme'

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
export async function findAllElement(
  selectors: string,
  fn = (e: Element[]) => e.length > 0,
  timeout = 10000
): Promise<Element[]> {
  const elements = await findBase<Element[]>(
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
export async function findElement(
  selectors: string,
  fn = (el: HTMLElement | null) => !!el,
  timeout = 10000
): Promise<HTMLElement> {
  const element = await findBase<HTMLElement>(
    () => document.querySelector(selectors),
    fn,
    timeout
  )
  return element
}

/** 通过 XPath 查找元素
 * 返回一个 Promise,当找与 XPath 匹配的元素时,返回找到的这个元素;如果在超时时间内未找到与选择器匹配的元素时,则 Promise 会被拒绝.
 * @param xpath 需要匹配的 XPath
 * @param fn 判断是否找到元素的函数
 * @param timeout 超时设置,默认为 10000
 * @returns 返回找到的元素
 */
export async function findElementByXPath(
  xpath: string,
  fn = (el: HTMLElement | null) => !!el,
  timeout = 10000
): Promise<HTMLElement> {
  const element = await findBase<HTMLElement>(
    () =>
      document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue,
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

    history.pushState = function pushState(...args) {
      const res = oldPushState.apply(this, args)
      window.dispatchEvent(new Event('urlchange'))
      return res
    }

    history.replaceState = function replaceState(...args) {
      const res = oldReplaceState.apply(this, args)
      window.dispatchEvent(new Event('urlchange'))
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
  const data = await Promise.race([
    fetch(
      'https://cdn.jsdelivr.net/gh/zerotrac/leetcode_problem_rating/data.json'
    ).then(res => res.json()),
    fetch(
      'https://raw.githubusercontent.com/zerotrac/leetcode_problem_rating/main/data.json'
    ).then(res => res.json()),
  ])
  return data
}

/** 判断对应的页面是否加载
 *
 *  在使用前端路由跳转的时候，如果只使用 url 进行判断的话，
 *  有可能出现 url 已经变成对应的页面，但页面还停留在其他页面的情况，
 *  会导致结果出错，这里通过判断对应页面的导航按钮的样式来确定是否已经加载对应的页面
 *  @param name 对应页面在导航中的名称
 *
 */
export const pageIsLoad = async (name: string): Promise<boolean> => {
  const el = await findElementByXPath(`//li[text()="${name}"]`)
  const hr = el.parentElement?.nextElementSibling
  if (!hr) return false
  return getComputedStyle(hr)['visibility'] === 'visible'
}

export function routerTo(url: string): void {
  const next = (window as any).next
  if (!next) return
  next.router.push(url, undefined, { shallow: true })
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
