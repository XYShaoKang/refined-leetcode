import { FC, useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import { useGetPredictionQuery } from './rankSlice'

type ItmeType = {
  row: number
  col: number
  hasMyRank: boolean
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

const DefaultIcon = styled.span`
  &::before {
    content: '\f1c9';
  }
`

const StyleSvg = styled.svg<{ size?: number }>`
  height: 1em;
  width: 1em;
  transform: translateY(0.125em) translateX(-5px) scale(1.4);

  & > image {
    height: 1em;
    width: 1em;
  }

  ${({ size }) => (size ? `font-size: ${size}px;` : '')}
`

type ParamType = {
  contestId: string
  page: number
  region: string
  username?: string
}

// TODO: 切换页数后,如果原先位置没有代码,会出现不加在图标的情况
const FileIcon: FC<ItmeType> = ({ row, col, hasMyRank }) => {
  const [param] = useUrlChange()
  const params: ParamType = { ...param }
  if (hasMyRank) {
    const username = (window as any).LeetCodeData.userStatus.username
    params.username = username
  }

  const { data: items } = useGetPredictionQuery(params)

  const iconFile = items?.[row]?.submission?.[col]?.iconFile

  if (!items || !iconFile) {
    return <DefaultIcon className="fa fa-file-code-o" />
  }

  return (
    <StyleSvg>
      <image href={iconFile} />
    </StyleSvg>
  )
}

export default FileIcon
