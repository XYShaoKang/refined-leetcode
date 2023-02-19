import { FC, useState } from 'react'

import { withPage } from '@/hoc'
import { useAppSelector, useEffectMount } from '@/hooks'

import { selectOptions } from '../global/optionsSlice'
import { Portal } from '@/components/Portal'
import { findElement, findAllElement } from '@/utils'
import Item from './Item'
import Title from './Title'
import { LanguageIconRow } from './LanguageIcon'
import { debounce } from 'src/utils'

const App: FC = () => {
  const options = useAppSelector(selectOptions)
  const [titleRoot, setTitleRoot] = useState<HTMLElement>()
  const [rows, setRows] = useState<HTMLElement[]>()

  useEffectMount(async state => {
    const handleChange = debounce(async () => {
      const parent = await findElement('.table-responsive>table>thead>tr')
      const trs = await findAllElement('.table-responsive>table>tbody>tr')
      if (state.isMount) {
        setTitleRoot(parent)
        setRows([...trs])
      }
    }, 100)
    handleChange()
    window.addEventListener('urlchange', handleChange)
  }, [])

  const hasMyRank = rows?.[0]?.className === 'success' ? true : false
  const showPredictordelta = !!options?.contestRankingPage.ratingPredictor
  const showLanguageIcon = !!options?.contestRankingPage.languageIcon
  const showNewRating = !!options?.contestRankingPage.showNewRating
  const showOldRating = !!options?.contestRankingPage.showOldRating

  return (
    <>
      {(showPredictordelta || showNewRating) && titleRoot && (
        <Portal container={titleRoot}>
          <th>
            <Title
              showOldRating={showOldRating}
              showPredictordelta={showPredictordelta}
              showNewRating={showNewRating}
            />
          </th>
        </Portal>
      )}
      {(showPredictordelta || showNewRating) &&
        rows?.map((row, i) => (
          <Item
            key={i}
            row={row}
            index={i}
            hasMyRank={hasMyRank}
            showOldRating={showOldRating}
            showPredictordelta={showPredictordelta}
            showNewRating={showNewRating}
          />
        ))}
      {showLanguageIcon &&
        rows?.map((row, i) => (
          <LanguageIconRow key={i} row={row} i={i} hasMyRank={hasMyRank} />
        ))}
    </>
  )
}

export default withPage('contestRankingPage')(App)
