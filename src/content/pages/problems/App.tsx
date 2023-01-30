import { FC, useEffect, useState } from 'react'

import { withPage } from '@/hoc'
import { useAppSelector } from '@/hooks'

import { selectOptions } from '../global/optionsSlice'
import Timer from './Timer'
import { findElement, isBetaUI } from '@/utils'
import { getRoot } from './utils'
import { Portal } from '@/components/Portal'
import Random from './Random'
import { fixBack } from './fixBack'

const App: FC<{ beta?: boolean }> = () => {
  const options = useAppSelector(selectOptions)
  const [beta, setBeta] = useState<boolean>()
  const [timerRoot, setTimerRoot] = useState<HTMLElement>()
  const [randomRoot, setRandomRoot] = useState<HTMLElement>()
  useEffect(() => {
    let isMount = true
    void (async function () {
      const beta = await isBetaUI()
      const parent = await getRoot()
      if (!isMount) return

      fixBack()

      const root = document.createElement('div')
      if (!beta) root.style.marginRight = '15px'
      setBeta(beta)
      setTimerRoot(root)
      parent.prepend(root)
      if (beta) {
        const nav = await findElement(
          '#__next > div > div > div > nav > div > div > div:nth-child(2)'
        )
        const randomRoot = document.createElement('div')
        randomRoot.style.lineHeight = '0'
        setRandomRoot(randomRoot)
        nav.append(randomRoot)
      }
    })()
    return () => {
      isMount = false
    }
  }, [])

  const showTimer = !!options?.problemsPage.timer
  const showRandomQuestion = !!options?.problemsPage.randomQuestion
  return (
    <>
      {timerRoot && showTimer && (
        <Portal container={timerRoot}>
          <Timer beta={beta} />
        </Portal>
      )}
      {randomRoot && showRandomQuestion && (
        <Portal container={randomRoot}>
          <Random />
        </Portal>
      )}
    </>
  )
}

export default withPage('problemsPage')(App)
