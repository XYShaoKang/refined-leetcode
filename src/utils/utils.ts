/** 限流
 *
 * @param fn 要执行的函数
 * @param interval 间隔时间
 */
export function throttle<T extends (...args: any) => void>(
  fn: T,
  interval = 0
): T {
  let pre: number
  return ((...args: any) => {
    const cur = new Date().valueOf()
    if (!pre || cur - pre >= interval) {
      pre = cur
      fn(...args)
    }
  }) as T
}

/** 防抖
 *
 * @param fn 要执行的函数
 * @param delay 延迟时间
 */
export function debounce<T extends (...args: any) => void>(
  fn: T,
  delay = 0
): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: any) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T
}
