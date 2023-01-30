import Rank from './Rank'
import './intercept'
import { FC, useEffect, useState } from 'react'
import { useAppSelector } from '@/hooks'
import { selectOptions } from '../global/optionsSlice'
import { findElementByXPath } from '@/utils'
import { Portal } from '@/components/Portal'
import ProblemList from '../problem-list/ProblemList'
import { withPage } from '@/hoc'

const App: FC = () => {
  const options = useAppSelector(selectOptions)
  const [problemListRoot, setProblemListRoot] = useState<HTMLElement>()
  useEffect(() => {
    let isMount = true,
      unmount: () => void
    void (async function () {
      const problemListXPath =
        '//*[@id="__next"]/*//span[text()="精选题单"]/../../..'
      const el = await findElementByXPath(problemListXPath)

      if (isMount) {
        const root = document.createElement('div')
        el.parentNode?.insertBefore(root, el)
        setProblemListRoot(root)
        unmount = () => root.remove()
      }
    })()
    return () => {
      isMount = false
      unmount && unmount()
    }
  }, [])

  const showProblemList = !!options?.problemsetPage.problemList
  const showRank = !!options?.problemsetPage.problemRating
  return (
    <>
      <Rank enable={showRank} />
      {showProblemList && problemListRoot && (
        <Portal container={problemListRoot}>
          <ProblemList />
        </Portal>
      )}
    </>
  )
}

export default withPage('problemsetPage')(App)
