import { FC, useEffect, useState } from 'react'

import { useGetPredictionQuery } from './rankSlice'

type ItmeType = {
  index: number
}

function getParam() {
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
    const handle = () => {
      setParam(getParam())
    }
    window.addEventListener('afterurlchange', handle)
    return () => {
      window.removeEventListener('afterurlchange', handle)
    }
  }, [])
  useEffect(() => {
    const checkbox = document.querySelector(
      '.checkbox>label>input'
    ) as HTMLInputElement
    const handle = (_e: Event) => {
      setParam(getParam())
    }
    checkbox.addEventListener('change', handle)
    return () => {
      checkbox.removeEventListener('change', handle)
    }
  })
  return [param] as const
}

type ParamType =
  | {
      contestId: string
      page: number
      region: string
    }
  | {
      contestId: string
      usernames: string[]
      region: string
    }

const Item: FC<ItmeType> = ({ index }) => {
  const [param] = useUrlChange()
  let params: ParamType = { ...param }
  if (index === -1) {
    const username = (window as any).LeetCodeData.userStatus.username
    params = {
      usernames: [username],
      contestId: params.contestId,
      region: params.region,
    }
  }

  const { data: items } = useGetPredictionQuery(params)
  if (!items) {
    return <span> ...loading</span>
  }

  let predictor: number | undefined =
    index === -1 ? items[0]?.delta : items?.[index]?.delta
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
