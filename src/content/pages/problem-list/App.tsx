import Rank from '../problemset/Rank'
import { FC, useEffect, useState } from 'react'
import { useAppSelector } from '@/hooks'
import { selectOptions } from '../global/optionsSlice'
import { findElementByXPath } from '@/utils'
import { Portal } from '@/components/Portal'
import ProblemList from './ProblemList'
import { withPage } from '@/hoc'
import { fixRandom } from './fixRandom'

const App: FC = () => {
  const options = useAppSelector(selectOptions)
  const [problemListRoot, setProblemListRoot] = useState<HTMLElement>()
  useEffect(() => {
    fixRandom()
    let isMount = true,
      unmount: () => void
    void (async function () {
      const problemListXPath =
        '//*[@id="__next"]/div/div[2]/div/div[2]/div/*//span[text()="精选题单"]/../..'
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

  const showProblemList = !!options?.problemListPage.problemList
  const showRank = !!options?.problemListPage.problemRating
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

export default withPage('problemListPage')(App)
