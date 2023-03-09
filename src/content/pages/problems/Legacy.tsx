import { FC, useState } from 'react'

import { useAppSelector, useEffectMount } from '@/hooks'

import { selectOptions } from '../global/optionsSlice'
import Timer from './Timer'
import { getRoot } from './utils'

const Legacy: FC<{ beta?: boolean }> = () => {
  const options = useAppSelector(selectOptions)
  const [timerRoot, setTimerRoot] = useState<HTMLElement>()

  useEffectMount(async state => {
    const parent = await getRoot()
    if (!state.isMount) return

    const root = document.createElement('div')
    root.style.marginRight = '15px'
    parent.prepend(root)
    setTimerRoot(root)
    state.unmount.push(() => root && root.remove())
  }, [])

  const showTimer = !!options?.problemsPage.timer

  return (
    <>{showTimer && timerRoot && <Timer beta={false} root={timerRoot} />}</>
  )
}

export default Legacy
