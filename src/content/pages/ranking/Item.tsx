import { useAppSelector, useEffectMount } from '@/hooks'
import { FC, memo, useState } from 'react'
import { css } from 'styled-components/macro'

import { debounce } from 'src/utils'

import { selectUserPredict, selectContestInfo } from './rankSlice'
import { findElementByXPath } from '@/utils'

type ItmeType = {
  contestSlug: string
  region: string
  username: string
  showOldRating: boolean
  showPredictordelta: boolean
  showNewRating: boolean
  showExpectingRanking: boolean
  realTime: boolean
  beta?: boolean
}

export type PageParamType = {
  contestId: string
  page: number
  username?: string
  region: 'local' | 'global'
}

function getParam(beta?: boolean): PageParamType {
  const [, contestId, , pageStr = '1'] = location.pathname
    .split('/')
    .filter(Boolean)
  const page = Number(pageStr)
  let region: 'local' | 'global' = 'local'
  if (beta) {
    const btn = document.evaluate(
      '//*[@id="__next"]//button[text()="全国"]',
      document,
      null,
      XPathResult['FIRST_ORDERED_NODE_TYPE'],
      null
    ).singleNodeValue as HTMLButtonElement
    if (btn && btn.dataset.state !== 'active') {
      region = 'global'
    }
  } else {
    const checkbox = document.querySelector(
      '.checkbox>label>input'
    ) as HTMLInputElement
    region = checkbox?.checked ? 'global' : 'local'
  }

  return { contestId, page, region }
}

export function useUrlChange(beta?: boolean): [PageParamType] {
  const [param, setParam] = useState(getParam(beta))
  useEffectMount(state => {
    const handle = debounce(() => {
      if (state.isMount) setParam(getParam(beta))
    }, 100)
    window.addEventListener('urlchange', handle)
    state.unmount.push(() => {
      handle.cancel()
      window.removeEventListener('urlchange', handle)
    })
  }, [])
  // 是否选中「显示全球」
  useEffectMount(async state => {
    const handle = debounce((_e: Event) => {
      if (state.isMount) setParam(getParam(beta))
    }, 100)
    if (beta) {
      const el = await findElementByXPath(
        '//*[@id="__next"]//button[text()="全国"]'
      )
      el.parentElement!.addEventListener('click', handle)
      state.unmount.push(() => {
        handle.cancel()
        el.parentElement!.removeEventListener('change', handle)
      })
    } else {
      const checkbox = document.querySelector(
        '.checkbox>label>input'
      ) as HTMLInputElement
      if (!checkbox) return
      checkbox.addEventListener('change', handle)
      state.unmount.push(() => {
        handle.cancel()
        checkbox.removeEventListener('change', handle)
      })
    }
  })
  return [param]
}

export const Item: FC<ItmeType> = memo(function Item({
  contestSlug,
  region,
  username,
  showOldRating,
  showPredictordelta,
  showNewRating,
  showExpectingRanking,
  realTime,
  beta,
}) {
  let { delta, oldRating, erank, rank, isStable } =
    useAppSelector(state =>
      selectUserPredict(state, contestSlug, region, username, !!realTime)
    ) ?? {}
  const info = useAppSelector(state => selectContestInfo(state, contestSlug))
  if (!oldRating || !info) return <></>

  let deltaEl, newRatingEl
  if (typeof delta !== 'number') {
    deltaEl = <></>
    newRatingEl = <></>
  } else {
    const deltaNum = Number(delta.toFixed(1))
    deltaEl = (
      <div
        css={css`
          font-weight: bold;
          color: ${delta >= 0
            ? `rgb(0 136 0 / ${Math.min(delta / 100, 1) * 70 + 30}%)`
            : `rgb(64 64 64 / ${Math.min(-delta / 100, 1) * 70 + 30}%)`};
          width: 60px;
          ${beta && delta < 0 ? `filter: invert(100%);;` : ''}
        `}
      >
        {deltaNum > 0 ? `+${deltaNum}` : deltaNum}
      </div>
    )
    const newRating = Number(((delta ?? 0) + oldRating).toFixed(1))
    newRatingEl = (
      <div
        css={
          showPredictordelta
            ? // 如果有显示分数变化，则新分数只需要区分颜色
              css`
                width: 70px;
                font-weight: bold;
                color: ${delta >= 0
                  ? `rgb(0 136 0 / ${Math.min(delta / 100, 1) * 70 + 30}%)`
                  : `rgb(64 64 64 / ${Math.min(-delta / 100, 1) * 70 + 30}%)`};
                ${beta && delta < 0 ? `filter: invert(100%);;` : ''}
              `
            : // 如果没有显示分数变化，则需要将分数变化反应到颜色的深浅中
              css`
                width: 70px;
                font-weight: bold;
                color: ${delta >= 0
                  ? `rgb(0 136 0 / ${Math.min(delta / 100, 1) * 70 + 30}%)`
                  : `rgb(64 64 64 / ${Math.min(-delta / 100, 1) * 70 + 30}%)`};
                ${beta && delta < 0 ? `filter: invert(100%);;` : ''}
              `
        }
      >
        {newRating}
      </div>
    )
  }

  oldRating = Number(oldRating.toFixed(1))
  const { start_time, duration } = info.contest
  const inContest = new Date().valueOf() <= (start_time + duration) * 1000

  const color = beta ? 'rgba(255, 255, 255, 0.6)' : '#000'

  return (
    <div
      css={css`
        display: flex;
        height: 100%;
        align-items: center;
      `}
    >
      {showOldRating && <div style={{ width: 60 }}>{oldRating}</div>}
      {showPredictordelta && deltaEl}
      {showNewRating && newRatingEl}
      {showExpectingRanking && realTime && erank && (
        <div style={{ display: 'flex' }}>
          <span style={{ color: isStable || !inContest ? color : '#bbb' }}>
            {rank}
          </span>
          <span style={{ margin: '0 10px' }}>/</span>
          <span>{Math.round(erank)}</span>
        </div>
      )}
    </div>
  )
})
