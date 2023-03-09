import { FC, useState } from 'react'

import { useAppSelector, useEffectMount, useObserverAncestor } from '@/hooks'

import { selectOptions } from '../global/optionsSlice'
import Timer from './Timer'
import { findElement } from '@/utils'
import { getRoot } from './utils'
import { Portal } from '@/components/Portal'
import Random from './Random'

const Beta: FC<{ beta?: boolean }> = () => {
  const options = useAppSelector(selectOptions)
  const [timerRoot, setTimerRoot] = useState<HTMLElement>()
  const [randomRoot, setRandomRoot] = useState<HTMLElement>()

  useEffectMount(async state => {
    //#region 设置「随机一题」
    const nav = await findElement(
      '#__next > div > div > div > nav > div > div > div:nth-child(2)'
    )
    if (!state.isMount) return
    const randomRoot = document.createElement('div')
    randomRoot.style.lineHeight = '0'
    setRandomRoot(randomRoot)
    nav.append(randomRoot)
    state.unmount.push(() => randomRoot && randomRoot.remove())
    //#endregion
  }, [])

  useObserverAncestor(async state => {
    const parent = await getRoot()
    if (!state.isMount) return

    const root = document.createElement('div')
    parent.prepend(root)
    setTimerRoot(root)
    state.unmount.push(() => root && root.remove())
    return root!
  })

  const showTimer = !!options?.problemsPage.timer
  const showRandomQuestion = !!options?.problemsPage.randomQuestion
  return (
    <>
      {showTimer && timerRoot && <Timer beta={true} root={timerRoot} />}
      {randomRoot && showRandomQuestion && (
        <Portal container={randomRoot}>
          <Random />
        </Portal>
      )}
    </>
  )
}

export default Beta
