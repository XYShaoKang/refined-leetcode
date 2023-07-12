import { FC, useState } from 'react'

import { useAppSelector, useObserverAncestor } from '@/hooks'

import { selectOptions } from '../global/optionsSlice'
import Timer from './Timer'
import { getRoot } from './utils'

const DynamicLayout: FC<{ beta?: boolean }> = () => {
  const options = useAppSelector(selectOptions)
  const [timerRoot, setTimerRoot] = useState<HTMLElement>()

  const showTimer = !!options?.problemsPage.timer

  useObserverAncestor(
    async state => {
      if (!showTimer) return
      const parent = await getRoot(true)

      // 创建「计时器」按钮根元素
      if (!parent || !state.isMount) return

      const root = document.createElement('div')
      parent.style.display = 'flex'
      parent.append(root)
      setTimerRoot(root)
      state.unmount.push(() => root && root.remove())
      return root!
    },
    [showTimer]
  )

  return (
    <>
      {showTimer && timerRoot && (
        <Timer beta={true} root={timerRoot} dynamicLayout={true} />
      )}
    </>
  )
}

export default DynamicLayout
