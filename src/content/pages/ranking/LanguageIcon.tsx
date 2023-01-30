import { FC, useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import { debounce } from '../../../utils'

import { ParamType, useGetContestQuery } from './rankSlice'
import { Portal } from '@/components/Portal'

type ItmeType = {
  row: number
  col: number
  hasMyRank: boolean
  parent: HTMLElement
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
      handle.cancel()
      window.removeEventListener('urlchange', handle)
    }
  }, [])
  // 是否选中「显示全球」
  useEffect(() => {
    const checkbox = document.querySelector(
      '.checkbox>label>input'
    ) as HTMLInputElement
    if (!checkbox) return
    const handle = debounce((_e: Event) => {
      setParam(getParam())
    }, 100)
    checkbox.addEventListener('change', handle)
    return () => {
      handle.cancel()
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

function setDisplay(el: Element | undefined, display: string) {
  if (el instanceof HTMLElement) {
    el.style.display = display
  }
}

const LanguageIcon: FC<ItmeType> = ({ parent, row, col, hasMyRank }) => {
  const [param] = useUrlChange()
  const [show, setShow] = useState(!!parent.childElementCount)

  const params: ParamType = { ...param }
  if (hasMyRank) {
    const username = (window as any).LeetCodeData.userStatus.username
    params.username = username
  }

  const { data: items } = useGetContestQuery(params)
  const iconFile = items?.[row]?.[col]?.iconFile

  useEffect(() => {
    setDisplay(parent.children[0]?.children[0], 'none')

    return () => {
      setDisplay(parent.children[0]?.children[0], '')
    }
  }, [])
  useEffect(() => {
    const handleChange = debounce(() => {
      setShow(!!parent.childElementCount)
      setDisplay(parent.children[0]?.children[0], 'none')
    }, 10)
    handleChange()
    const observer = new MutationObserver(handleChange)
    observer.observe(parent, { childList: true })
    return () => {
      handleChange.cancel()
      observer.disconnect()
    }
  }, [])
  if (!show) return null

  return (
    <Portal container={parent.children[0] as HTMLElement}>
      {!items || !iconFile ? (
        <DefaultIcon className="fa fa-file-code-o" />
      ) : (
        <StyleSvg>
          <image href={iconFile} />
        </StyleSvg>
      )}
    </Portal>
  )
}

export const LanguageIconRow: FC<{
  row: HTMLElement
  i: number
  hasMyRank: boolean
}> = ({ row, i, hasMyRank }) => {
  const tds = Array.prototype.slice.call(row.children, 4, 8)
  return (
    <>
      {tds.map((td, j) => (
        <LanguageIcon
          key={j}
          parent={td}
          row={i}
          col={j}
          hasMyRank={hasMyRank}
        />
      ))}
    </>
  )
}

export default LanguageIcon
