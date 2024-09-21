import { FC } from 'react'
import { Portal } from '@/components/Portal'
import { Item, useUrlChange } from './Item'

import { useFetchPreviousRatingData, usePredict, useUser } from './utils'
import { TDWrap } from './Predict'

interface RealTimePredictItemProps {
  isVirtual?: boolean
  hasMyRank: boolean
  showOldRating: boolean
  showPredictordelta: boolean
  showNewRating: boolean
  showExpectingRanking: boolean
  index: number
  row: HTMLElement
  beta?: boolean
}
export const RealTimePredictItem: FC<RealTimePredictItemProps> = ({
  hasMyRank,
  index,
  row,
  beta,
  ...props
}) => {
  const { username, region } = useUser(hasMyRank, index, row, beta)
  const [{ contestId: contestSlug }] = useUrlChange(beta)

  usePredict({
    username,
    region,
    contestSlug,
  })

  return (
    <Item
      realTime={true}
      {...{ ...props, contestSlug, region, username }}
      beta={beta}
    />
  )
}
interface RealTimePredictProps {
  rows: HTMLElement[]
  hasMyRank: boolean
  showOldRating: boolean
  showPredictordelta: boolean
  showNewRating: boolean
  showExpectingRanking: boolean
  beta?: boolean
}

export const RealTimePredict: FC<RealTimePredictProps> = ({
  rows,
  hasMyRank,
  ...props
}) => {
  const [{ contestId: contestSlug }] = useUrlChange(props.beta)
  useFetchPreviousRatingData(contestSlug)

  const borderColor = props.beta ? '#888' : '#ddd'

  return (
    <>
      {rows.map((row, i) => (
        <Portal container={row} key={i}>
          <TDWrap
            style={{
              borderLeft: `2px dashed ${borderColor}`,
              borderRight: `2px dashed ${borderColor}`,
              borderBottom:
                i === rows.length - 1 ? `2px dashed ${borderColor}` : '',
              height: '100%',
              width: 300,
              padding: 8,
            }}
            beta={props.beta}
          >
            <RealTimePredictItem
              row={row}
              {...{ ...props, hasMyRank, index: i }}
            />
          </TDWrap>
        </Portal>
      ))}
    </>
  )
}
