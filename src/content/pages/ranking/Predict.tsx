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
  showExpectingRanking: boolean
  index: number
  row: HTMLElement
  beta?: boolean
}
const PredictItem = memo(function PredictItem({
  hasMyRank,
  row,
  index,
  beta,
  ...props
}: PredictItemProps) {
  const { username, region } = useUser(hasMyRank, index, row, beta)
  const [{ contestId: contestSlug }] = useUrlChange()

  return (
    <Item
      realTime={false}
      {...{ ...props, username, region, contestSlug }}
      beta={beta}
    />
  )
})

interface PredictProps {
  rows: HTMLElement[]
  hasMyRank: boolean
  showOldRating: boolean
  showPredictordelta: boolean
  showNewRating: boolean
  showExpectingRanking: boolean
  userInfos: User[]
  beta?: boolean
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
            <TDWrap beta={props.beta} style={{ height: '100%', width: 200 }}>
              <PredictItem {...{ ...props, hasMyRank, index: i, row }} />
            </TDWrap>
          ) : (
            <TDWrap style={{ display: 'none', width: 200 }} />
          )}
        </Portal>
      ))}
    </>
  )
})

type TDWrapProps = React.HTMLAttributes<HTMLElement> & {
  beta?: boolean
  children?: React.ReactNode
}

export const TDWrap = ({ beta, children, ...props }: TDWrapProps) => {
  if (beta) {
    return <div {...props}>{children}</div>
  }
  return <td {...props}>{children}</td>
}

export default Predict
