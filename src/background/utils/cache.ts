/**
 * 根据 key 缓存函数执行结果
 * @param keyFn 生成缓存的  key
 * @param handle 输出函数
 * @param timeout 超时设置,单位为毫秒,默认为 10 分钟,如果缓存数据超过 timeout,则重新获取结果
 * @returns
 */
export function cache<T extends any[], R>(
  keyFn: (...args: T) => string,
  handle: (...args: T) => Promise<R> | R,
  timeout = 600000
): (...args: T) => Promise<R> {
  const map = new Map<string, [Promise<R> | R, number]>()
  return async (...args: T) => {
    const key = keyFn(...args)
    if (map.has(key)) {
      const [promise, time] = map.get(key)!
      if (new Date().valueOf() - time <= timeout) {
        try {
          const data = await promise
          return data
        } catch (error) {
          // 如果当前缓存有错误,则舍弃缓存的结果,重新获取
        }
      }
    }
    const promise = handle(...args)

    map.set(key, [promise, new Date().valueOf()])
    return promise
  }
}
