import { useCallback, useLayoutEffect, useRef } from 'react'

/**
 * @see https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
 */
const useEvent = <T extends (...args: any[]) => any>(fn: T): T => {
  const ref = useRef<T>(fn)
  useLayoutEffect(() => {
    ref.current = fn
  })

  return useCallback(((...args) => ref.current(...args)) as T, [])
}

export { useEvent }
