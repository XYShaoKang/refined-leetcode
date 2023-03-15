import { memo, useEffect } from 'react'

import { fetchPrediction } from './rankSlice'
import { Portal } from '@/components/Portal'
import { Item, useUrlChange } from './Item'
import { User, useUser } from './utils'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { selectOptions } from '../global/optionsSlice'

interface PredictItemProps {
  hasMyRank: boolean
  showOldRating: boolean
  showPredictordelta: boolean
  showNewRating: boolean
  index: number
  row: HTMLElement
}
const PredictItem = memo(function PredictItem({
  hasMyRank,
  row,
  index,
  ...props
}: PredictItemProps) {
  const { username, region } = useUser(hasMyRank, index, row)
  const [{ contestId: contestSlug }] = useUrlChange()
  return (
    <Item realTime={false} {...{ ...props, username, region, contestSlug }} />
  )
})

interface PredictProps {
  rows: HTMLElement[]
  hasMyRank: boolean
  showOldRating: boolean
  showPredictordelta: boolean
  showNewRating: boolean
  userInfos: User[]
}
const Predict = memo(function Predict({
  hasMyRank,
  rows,
  userInfos,
  ...props
}: PredictProps) {
  const [{ contestId }] = useUrlChange()
  const options = useAppSelector(selectOptions)

  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(fetchPrediction({ contestSlug: contestId, users: userInfos }))
  }, [dispatch, contestId, JSON.stringify(userInfos)])

  const showPredict = !!options?.contestRankingPage.showPredict
  return (
    <>
      {rows.map((row, i) => (
        <Portal container={row} key={i}>
          {showPredict ? (
            <td>
              <PredictItem {...{ ...props, hasMyRank, index: i, row }} />
            </td>
          ) : (
            <td style={{ display: 'none' }} />
          )}
        </Portal>
      ))}
    </>
  )
})

export default Predict
