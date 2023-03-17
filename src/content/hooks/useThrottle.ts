import { useMemo } from 'react'
import { throttle } from 'src/utils'

export function useThrottle<
  T extends (...args: any) => Promise<boolean | void> | boolean | void,
  R = (...args: Parameters<T>) => Promise<void>
>(fn: T, interval = 0): R {
  const handle = useMemo(() => throttle(fn, interval), []) as R
  return handle
}
