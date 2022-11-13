import { useCallback, useRef, useState } from 'react'
import { useEvent } from './useEvent'

/**
 * 处理 hover 逻辑的钩子
 * @param delay hover 效果消失的延迟时间
 */
export const useHover = <T extends HTMLElement>(
  delay = 0
): [ref: (el: T | null) => void, hover: boolean] => {
  const ref = useRef<T | null>()
  const [hover, setHover] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const clearTimer = () => {
    if (timer.current !== undefined) {
      clearTimeout(timer.current)
      timer.current = undefined
    }
  }

  const handleMouseEnter = useEvent((_e: MouseEvent) => {
    setHover(true)
    clearTimer()
  })

  const handleMouseLeave = useEvent((_e: MouseEvent) => {
    timer.current = setTimeout(() => setHover(false), delay)
  })

  const refcb = useCallback((el: T | null) => {
    if (ref.current) {
      // ref 会在卸载时被设置为 null
      // 所以不用另外在 useEffect 去设置针对组件卸载时删除事件侦听器的逻辑,只要在这里设置即可

      clearTimer()
      setHover(false)

      ref.current.removeEventListener('mouseenter', handleMouseEnter)
      ref.current.removeEventListener('mouseleave', handleMouseLeave)
    }

    ref.current = el
    if (ref.current) {
      ref.current.addEventListener('mouseenter', handleMouseEnter)
      ref.current.addEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return [refcb, hover]
}
