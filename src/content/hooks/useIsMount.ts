import { useEffect, useRef } from 'react'

export type State = {
  isMount: boolean
  unmount: Array<() => void>
}

/**
 * 处理组件卸载逻辑
 */
export const useUnMount = (): State => {
  const { current: state } = useRef<State>({ isMount: true, unmount: [] })
  useEffect(() => {
    state.isMount = true
    return () => {
      state.isMount = false
      while (state.unmount.length) {
        const fn = state.unmount.pop()
        if (fn instanceof Function) fn()
      }
    }
  }, [])
  return state
}
