import { useEffect, useRef } from 'react'
import { useEvent } from './useEvent'
import { State, useUnMount } from './useIsMount'

/** 用于当祖先元素发生变化时，执行特定的操作
 *
 * 原理是通过 MutationObserver 监听对应祖先元素是否被删除，如果被删除，
 * 则需要重新挂载元素或绑定事件，并将新元素的祖先结点重新绑定 MutationObserver 事件
 *
 * 主要针对某个结点其祖先元素有可能会被删除的场景
 *
 * @param onChange 当祖先元素发生变化时，需要执行的操作
 * @param getAncestor 获取监听的祖先元素
 * @param check 检查是否满足变化的条件
 *
 * @todo 当同时有多个地方使用 useObserverAncestor 时，尝试合并监听的事件，以提升性能
 */
export const useObserverAncestor = (
  onChange: (
    state: State
  ) => HTMLElement | undefined | null | Promise<HTMLElement | undefined | null>
): void => {
  const state = useUnMount()
  const ancestorRef = useRef({
    ancestors: [] as HTMLElement[],
    ancestorSet: new Set<HTMLElement>(),
    observers: [] as MutationObserver[],
  })

  const mount = useEvent(async () => {
    let el = await onChange(state)
    if (!el) return
    const { ancestors, ancestorSet, observers } = ancestorRef.current
    const els: HTMLElement[] = []

    //#region 找到新元素和旧元素的公共祖先结点，然后将旧元素到公共祖先结点之间的元素删除，并删除对应的 MutationObserver
    while (el && !ancestorSet.has(el) && el !== document.body) {
      el = el.parentElement!
      els.push(el)
    }
    while (ancestors.length) {
      const ancestor = ancestors.pop()!
      ancestorSet.delete(ancestor)
      observers.pop()!.disconnect()
      if (ancestor === els[els.length - 1]) break
    }
    //#endregion

    // 添加新元素变化的部分祖先结点，并添加对应的 MutationObserver
    // 要判断当前结点是否被删除，必须要将 MutationObserver 挂载到父元素上
    while (els.length) {
      const el = els.pop()!
      const observer = new MutationObserver(mutations => {
        const checked = mutations.some(({ removedNodes }) =>
          Array.prototype.some.call(removedNodes, node => node === el)
        )
        if (checked) mount()
      })
      ancestors.push(el)
      ancestorSet.add(el)
      observers.push(observer)
      observer.observe(el.parentElement!, { childList: true })
      state.unmount.push(() => observer.disconnect())
    }
  })

  useEffect(() => {
    mount()
    return () => ancestorRef.current.observers.forEach(o => o.disconnect())
  }, [])
}
