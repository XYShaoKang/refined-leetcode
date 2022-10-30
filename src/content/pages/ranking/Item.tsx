import { FC, useEffect, useState } from 'react'
import { debounce } from '../../utils'

import { ParamType, useGetPredictionQuery } from './rankSlice'

type ItmeType = {
  row: number
  hasMyRank: boolean
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
    window.addEventListener('afterurlchange', handle)
    return () => {
      window.removeEventListener('afterurlchange', handle)
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

const Item: FC<ItmeType> = ({ row, hasMyRank }) => {
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

  let predictor: number | undefined = items?.[row]?.delta

  if (!predictor) {
    return <span>{''}</span>
  }

  predictor = Math.round(predictor * 100) / 100

  return (
    <div style={{ color: predictor > 0 ? 'green' : 'gray' }}>
      {predictor > 0 ? `+${predictor}` : predictor}
    </div>
  )
}

export default Item
