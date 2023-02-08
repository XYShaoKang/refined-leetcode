import Rank from './Rank'
import './intercept'
import { FC, useState } from 'react'
import { useAppSelector, useEffectMount } from '@/hooks'
import { selectOptions } from '../global/optionsSlice'
import { awaitFn, problemsetPageIsLoad } from '@/utils'
import { Portal } from '@/components/Portal'
import ProblemList from '../problem-list/ProblemList'
import { withPage } from '@/hoc'
import { useSetProblemListRoot } from '../problem-list/useSetProblemListRoot'

const App: FC = () => {
  const options = useAppSelector(selectOptions)
  const [problemListRoot, setProblemListRoot] = useState<HTMLElement>()
  const [isLoad, setIsLoad] = useState(false)

  useEffectMount(async state => {
    await awaitFn(() => problemsetPageIsLoad())
    if (state.isMount) setIsLoad(true)
  })
  useSetProblemListRoot(
    '//*[@id="__next"]/*//span[text()="精选题单"]/../../..',
    isLoad,
    setProblemListRoot
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
