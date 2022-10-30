import { FC, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { debounce } from '../../utils'

import { ParamType, useGetContestQuery } from './rankSlice'

type ItmeType = {
  row: number
  col: number
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

const FileIcon: FC<ItmeType> = ({ row, col, hasMyRank }) => {
  const [param] = useUrlChange()

  const params: ParamType = { ...param }
  if (hasMyRank) {
    const username = (window as any).LeetCodeData.userStatus.username
    params.username = username
  }

  const { data: items } = useGetContestQuery(params)
  const iconFile = items?.[row]?.[col]?.iconFile

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
