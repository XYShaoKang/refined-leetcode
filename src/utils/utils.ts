/** 限流
 *
 * @param fn 要执行的函数,如果函数返回 true 时，则表示不去限制下一个函数的执行
 * @param interval 间隔时间
 *
 *
 */
export function throttle<
  T extends (...args: any) => Promise<boolean | void> | boolean | void,
  R = (...args: Parameters<T>) => Promise<void>
>(fn: T, interval = 0): R {
  let pre: number | null = null,
    next = false
  return (async (...args: any) => {
    const cur = new Date().valueOf()
    if (!pre || cur - pre >= interval || next) {
      pre = cur
      next = false
      if (await fn(...args)) next = true
    }
  }) as R
}

/** 防抖
 *
 * @param fn 要执行的函数
 * @param delay 延迟时间
 */
export function debounce<
  T extends (...args: any) => void,
  R extends T & { cancel: () => void; destroy: () => void }
>(fn: T, delay = 0): R {
  let timer: ReturnType<typeof setTimeout>,
    destroy = false
  const debounced: R = ((...args: any) => {
    if (timer) clearTimeout(timer)
    if (destroy) return
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as any
  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
  }
  debounced.destroy = () => {
    destroy = true
    if (timer) clearTimeout(timer)
  }
  return debounced
}
