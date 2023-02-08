import Rank from '../problemset/Rank'
import { FC, useEffect, useState } from 'react'
import { useAppSelector, useEffectMount } from '@/hooks'
import { selectOptions } from '../global/optionsSlice'
import { awaitFn, findElementByXPath, problemsetPageIsLoad } from '@/utils'
import { Portal } from '@/components/Portal'
import ProblemList from './ProblemList'
import { withPage } from '@/hoc'
import { fixRandom } from './fixRandom'

const App: FC = () => {
  const options = useAppSelector(selectOptions)
  const [problemListRoot, setProblemListRoot] = useState<HTMLElement>()
  const [isLoad, setIsLoad] = useState(false)
  useEffectMount(async state => {
    await awaitFn(async () => {
      const res = await problemsetPageIsLoad()
      return !res
    })
    if (state.isMount) setIsLoad(true)
  })

  useEffectMount(
    async state => {
      if (!isLoad) return
      const problemListXPath =
        '//*[@id="__next"]/div/div[2]/div/div[2]/div/*//span[text()="精选题单"]/../..'
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

  useEffect(() => {
    if (!isLoad) return
    fixRandom()
  }, [isLoad])

  if (!isLoad) return null
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
