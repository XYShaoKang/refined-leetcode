import { DependencyList, useEffect } from 'react'
import { State, useUnMount } from './useIsMount'

/** 判断当前组件是否被卸载,主要用于需要在 useEffect 中去处理一些异步任务
 *
 * @param effect 传入一个函数，这个函数接收一个 state 的参数，其中 state.isMount 就是标识当前是否被卸载，另外可以通过设置 state.unmount 来运行一些卸载的时候需要处理的逻辑
 * @param deps 是否需要依赖项，默认为空数组，既默认只会在组件加载时执行，在组件卸载时执行卸载操作
 *
 * @example
 * ```ts
 * useEffectMount(
 *   async state => {
 *     await awaitFn()
 *     if(!state.isMount) return // 如果当前组件已经被卸载则不去执行后面的语句
 *     state.unmount.push(()=>{ }) // 执行一些卸载操作
 *   },
 *   []
 * )
 * ```
 */
export const useEffectMount = (
  effect:
    | ((state: State) => void | (() => void))
    | ((state: State) => Promise<any>),
  deps: DependencyList = []
): void => {
  const state = useUnMount()
  useEffect(() => {
    const fn = effect(state)
    return () => {
      while (state.unmount.length) {
        const fn = state.unmount.pop()
        if (fn instanceof Function) fn()
      }
      if (fn instanceof Function) fn()
    }
  }, deps)
}
