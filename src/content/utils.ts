function download(str: string, filename = 'contest.md'): void {
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

/**
 * 查找匹配选择器的所有元素.返回一个 Promise,当找到任何与选择器匹配的元素时,则 resolve 一个包含所有与选择器匹配元素的数组;如果在超时时间内未找到与选择器匹配的元素时,则 Promise 会被拒绝.
 * @param selectors 需要匹配的选择器
 * @param timeout 超时设置,默认为 10000
 * @param fn 判断是否找到元素的函数
 * @returns 返回找到的所有元素
 */
async function findAllElement(
  selectors: string,
  timeout = 10000,
  fn = (e: Element[]) => e.length > 0
): Promise<Element[]> {
  const elements = await findBase<Element[]>(
    () => Array.from(document.querySelectorAll(selectors)),
    fn,
    timeout
  )
  return elements
}

/**
 * 查找匹配选择器的第一个元素.返回一个 Promise,当找到第一个与选择器匹配的元素时,则 resolve 找到的这个元素;如果在超时时间内未找到与选择器匹配的元素时,则 Promise 会被拒绝.
 * @param selectors 需要匹配的选择器
 * @param timeout 超时设置,默认为 10000
 * @returns 返回找到的元素
 */
async function findElement(
  selectors: string,
  timeout = 10000
): Promise<HTMLElement> {
  const element = await findBase<HTMLElement>(
    () => document.querySelector(selectors),
    el => !!el,
    timeout
  )
  return element
}

function getExtensionId(): string | undefined {
  const extensionId =
    document.getElementById('refined-leetcode')?.dataset.extensionid
  return extensionId
}

/**
 * 限流
 * @param fn 要执行的函数
 * @param interval 间隔时间
 */
function throttle<T extends (...args: any) => void>(fn: T, interval = 0): T {
  let pre: number
  return ((...args: any) => {
    const cur = new Date().valueOf()
    if (!pre || cur - pre >= interval) {
      pre = cur
      fn(...args)
    }
  }) as T
}

/**
 * 防抖
 * @param fn 要执行的函数
 * @param delay 延迟时间
 */
function debounce<T extends (...args: any) => void>(fn: T, delay = 0): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: any) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T
}

export {
  download,
  findElement,
  findAllElement,
  getExtensionId,
  throttle,
  debounce,
}
