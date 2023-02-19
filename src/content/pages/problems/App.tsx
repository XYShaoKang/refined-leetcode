import { FC, useState } from 'react'

import { withPage } from '@/hoc'
import { useAppSelector, useEffectMount } from '@/hooks'

import { selectOptions } from '../global/optionsSlice'
import Timer from './Timer'
import { findElement, findElementByXPath, isBetaUI } from '@/utils'
import { getRoot } from './utils'
import { Portal } from '@/components/Portal'
import Random from './Random'
import { fixBack } from './fixBack'

const App: FC<{ beta?: boolean }> = () => {
  const options = useAppSelector(selectOptions)
  const [beta, setBeta] = useState<boolean>()
  const [timerRoot, setTimerRoot] = useState<HTMLElement>()
  const [randomRoot, setRandomRoot] = useState<HTMLElement>()

  useEffectMount(async state => {
    const beta = await isBetaUI()
    if (!state.isMount) return
    if (beta) fixBack()
    setBeta(beta)

    //#region 设置「随机一题」
    if (beta) {
      const nav = await findElement(
        '#__next > div > div > div > nav > div > div > div:nth-child(2)'
      )
      const randomRoot = document.createElement('div')
      randomRoot.style.lineHeight = '0'
      setRandomRoot(randomRoot)
      nav.append(randomRoot)
    }
    //#endregion
  }, [])
  useEffectMount(async state => {
    const beta = await isBetaUI()
    if (!state.isMount) return

    //#region 设置「计时器」
    async function setRoot() {
      const parent = await getRoot()
      if (!state.isMount) return

      const root = document.createElement('div')
      setTimerRoot(root)
      if (!beta) root.style.marginRight = '15px'
      parent.prepend(root)
    }
    if (!beta) {
      setRoot()
      return
    }

    const mount = async () => {
      const parent = await getRoot()
      const consolePositionEl = (
        await findElementByXPath({
          xpath: "//div[contains(@class, 'console-position')]",
          nodeType: 'ORDERED_NODE_SNAPSHOT_TYPE',
        })
      ).find(el => el.contains(parent))

      if (!state.isMount) return
      setRoot()

      if (consolePositionEl) {
        const observer = new MutationObserver(mutations => {
          for (const mutation of mutations) {
            for (const node of mutation.removedNodes) {
              if (node === consolePositionEl) {
                observer.disconnect()
                mount()
              }
            }
          }
        })
        observer.observe(consolePositionEl.parentElement!, { childList: true })
      }
    }
    mount()
    //#endregion
  }, [])

  const showTimer = !!options?.problemsPage.timer
  const showRandomQuestion = !!options?.problemsPage.randomQuestion
  return (
    <>
      {showTimer && <Timer beta={beta} root={timerRoot} />}
      {randomRoot && showRandomQuestion && (
        <Portal container={randomRoot}>
          <Random />
        </Portal>
      )}
    </>
  )
}

export default withPage('problemsPage')(App)
