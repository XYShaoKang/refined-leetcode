import { useEffect, useRef, useState } from 'react'

/**
 * 处理 hover 逻辑的钩子
 * @param delay hover 效果消失的延迟时间
 */
export const useHover = <T extends HTMLElement>(
  delay = 0
): [ref: React.RefObject<T>, hover: boolean] => {
  const ref = useRef<T>(null)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handleMouseOver = (_e: MouseEvent) => {
      setHover(true)

      if (timer !== undefined) {
        clearTimeout(timer)
      }
    }
    const handleMouseOut = (_e: MouseEvent) => {
      timer = setTimeout(() => setHover(false), delay)
    }
    if (ref.current) {
      ref.current.addEventListener('mouseover', handleMouseOver)
      ref.current.addEventListener('mouseout', handleMouseOut)
    }
    return () => {
      if (ref.current) {
        ref.current.removeEventListener('mouseover', handleMouseOver)
        ref.current.removeEventListener('mouseout', handleMouseOut)
      }
    }
  }, [])
  return [ref, hover]
}
