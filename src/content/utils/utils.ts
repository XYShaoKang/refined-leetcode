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

function findBase<T>(
  find: () => any,
  fn: (el: T) => boolean,
  time = 10000,
  delay = 100
): Promise<T> {
  return new Promise(function (resolve, reject) {
    const timer = setInterval(() => {
      const element = find()
      if (fn(element)) {
        clearInterval(timer)
        resolve(element)
      }
      if (time <= 0) {
        clearInterval(timer)
        reject('超时')
      }
      time -= delay
    }, delay)
  })
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
  fn = (el: HTMLElement) => !!el,
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
  fn = (el: HTMLElement) => !!el,
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
  let beta: boolean | null = null
  return async function isBetaUI() {
    if (beta !== null) return beta

    const root = await Promise.race([
      findElement('#__next'),
      findElement('#app'),
    ])
    beta = root.id === '__next'
    return beta
  }
})()
