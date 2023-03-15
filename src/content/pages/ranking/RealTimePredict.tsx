import { FC } from 'react'
import { Portal } from '@/components/Portal'
import { Item, useUrlChange } from './Item'

import { useFetchPreviousRatingData, usePredict, useUser } from './utils'

interface RealTimePredictItemProps {
  isVirtual?: boolean
  hasMyRank: boolean
  showOldRating: boolean
  showPredictordelta: boolean
  showNewRating: boolean
  index: number
  row: HTMLElement
}
export const RealTimePredictItem: FC<RealTimePredictItemProps> = ({
  hasMyRank,
  index,
  row,
  ...props
}) => {
  const { username, region } = useUser(hasMyRank, index, row)
  const [{ contestId: contestSlug }] = useUrlChange()

  usePredict({
    username,
    region,
    contestSlug,
  })

  return (
    <Item realTime={true} {...{ ...props, contestSlug, region, username }} />
  )
}
interface RealTimePredictProps {
  rows: HTMLElement[]
  hasMyRank: boolean
  showOldRating: boolean
  showPredictordelta: boolean
  showNewRating: boolean
}

export const RealTimePredict: FC<RealTimePredictProps> = ({
  rows,
  hasMyRank,
  ...props
}) => {
  const [{ contestId: contestSlug }] = useUrlChange()
  useFetchPreviousRatingData(contestSlug)

  return (
    <>
      {rows.map((row, i) => (
        <Portal container={row} key={i}>
          <td
            style={{
              borderLeft: '2px dashed #ddd',
              borderRight: '2px dashed #ddd',
              borderBottom: i === rows.length - 1 ? '2px dashed #ddd' : '',
            }}
          >
            <RealTimePredictItem
              row={row}
              {...{ ...props, hasMyRank, index: i }}
            />
          </td>
        </Portal>
      ))}
    </>
  )
}
