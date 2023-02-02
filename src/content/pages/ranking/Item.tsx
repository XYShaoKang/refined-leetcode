import { FC, useEffect, useState } from 'react'
import { css } from 'styled-components/macro'

import { debounce } from '../../../utils'

import { ParamType, useGetPredictionQuery } from './rankSlice'

type ItmeType = {
  row: number
  hasMyRank: boolean
  showOldRating: boolean
  showPredictordelta: boolean
  showNewRating: boolean
}

function getParam(): ParamType {
  const [, contestId, , pageStr = '1'] = location.pathname
    .split('/')
    .filter(Boolean)
  const page = Number(pageStr)
  const checkbox = document.querySelector(
    '.checkbox>label>input'
  ) as HTMLInputElement
  const region = checkbox?.checked ? 'global' : 'local'

  return { contestId, page, region }
}

function useUrlChange() {
  const [param, setParam] = useState(getParam())
  useEffect(() => {
    const handle = debounce(() => {
      setParam(getParam())
    }, 100)
    window.addEventListener('urlchange', handle)
    return () => {
      window.removeEventListener('urlchange', handle)
    }
  }, [])
  useEffect(() => {
    const checkbox = document.querySelector(
      '.checkbox>label>input'
    ) as HTMLInputElement
    const handle = debounce((_e: Event) => {
      setParam(getParam())
    }, 100)
    checkbox.addEventListener('change', handle)
    return () => {
      checkbox.removeEventListener('change', handle)
    }
  })
  return [param] as const
}

const Item: FC<ItmeType> = ({
  row,
  hasMyRank,
  showOldRating,
  showPredictordelta,
  showNewRating,
}) => {
  const [param] = useUrlChange()
  const params: ParamType = { ...param }
  if (hasMyRank) {
    const username = (window as any).LeetCodeData.userStatus.username
    params.username = username
  }

  const { data: items } = useGetPredictionQuery(params)

  if (!items) {
    return <span> ...loading</span>
  }

  const predictor: number | undefined = items?.[row]?.delta?.toFixed(1),
    newRating = items?.[row]?.newRating?.toFixed(1),
    oldRating = items?.[row]?.oldRating?.toFixed(1)

  if (predictor === undefined) {
    return <></>
  }

  return (
    <div
      css={css`
        display: flex;
      `}
    >
      {showOldRating && <div style={{ width: 60 }}>{oldRating}</div>}
      {showPredictordelta && (
        <div
          css={css`
            color: ${predictor >= 0 ? 'green' : 'gray'};
            width: 55px;
          `}
        >
          {predictor > 0 ? `+${predictor}` : predictor}
        </div>
      )}
      {showNewRating && (
        <div
          css={
            showPredictordelta
              ? // 如果有显示分数变化，则新分数只需要区分颜色
                css`
                  color: ${predictor >= 0 ? `green` : `gray`};
                `
              : // 如果没有显示分数变化，则需要将分数变化反应到颜色的深浅中
                css`
                  font-weight: bold;
                  color: ${predictor >= 0
                    ? `rgb(0 136 0 / ${
                        Math.min(predictor / 100, 1) * 70 + 30
                      }%)`
                    : `rgb(64 64 64 / ${
                        Math.min(-predictor / 100, 1) * 70 + 30
                      }%)`};
                `
          }
        >
          {newRating}
        </div>
      )}
    </div>
  )
}

export default Item
