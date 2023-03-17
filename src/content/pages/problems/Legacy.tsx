import { FC, useState } from 'react'

import { useAppSelector, useObserverAncestor } from '@/hooks'

import { selectOptions } from '../global/optionsSlice'
import Timer from './Timer'
import { getRoot } from './utils'

const Legacy: FC<{ beta?: boolean }> = () => {
  const options = useAppSelector(selectOptions)
  const [timerRoot, setTimerRoot] = useState<HTMLElement>()
  const showTimer = !!options?.problemsPage.timer

  useObserverAncestor(
    async state => {
      if (!showTimer) return
      const parent = await getRoot()
      if (!state.isMount) return

      const root = document.createElement('div')
      root.style.marginRight = '15px'
      parent.prepend(root)
      setTimerRoot(root)
      state.unmount.push(() => root && root.remove())
      return root
    },
    [showTimer]
  )

  return (
    <>{showTimer && timerRoot && <Timer beta={false} root={timerRoot} />}</>
  )
}

export default Legacy
