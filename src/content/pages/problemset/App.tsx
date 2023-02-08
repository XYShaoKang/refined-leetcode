import Rank from './Rank'
import './intercept'
import { FC, useState } from 'react'
import { useAppSelector, useEffectMount } from '@/hooks'
import { selectOptions } from '../global/optionsSlice'
import { awaitFn, findElementByXPath, problemsetPageIsLoad } from '@/utils'
import { Portal } from '@/components/Portal'
import ProblemList from '../problem-list/ProblemList'
import { withPage } from '@/hoc'

const App: FC = () => {
  const options = useAppSelector(selectOptions)
  const [problemListRoot, setProblemListRoot] = useState<HTMLElement>()
  const [isLoad, setIsLoad] = useState(false)
  console.log(isLoad)
  useEffectMount(async state => {
    await awaitFn(() => problemsetPageIsLoad())
    if (state.isMount) setIsLoad(true)
  })

  useEffectMount(
    async state => {
      if (!isLoad) return
      const problemListXPath =
        '//*[@id="__next"]/*//span[text()="精选题单"]/../../..'
      const el = await findElementByXPath(problemListXPath)
      if (state.isMount) {
        const root = document.createElement('div')
        el.parentNode?.insertBefore(root, el)
        setProblemListRoot(root)
        state.unmount.push(() => root.remove())
      }
    },
    [isLoad]
  )

  if (!isLoad) return null

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
