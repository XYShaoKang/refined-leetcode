import { FC, memo, useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import { debounce } from '../../../utils'

import { ParamType, useGetContestQuery } from './rankSlice'
import { Portal } from '@/components/Portal'
import { useUrlChange } from './Item'

type ItmeType = {
  row: number
  col: number
  hasMyRank: boolean
  parent: HTMLElement
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
function isShow(parent: HTMLElement) {
  if (!parent.childElementCount) return false
  const [child] = parent.childNodes
  return (
    child instanceof HTMLAnchorElement &&
    child.children[0] instanceof HTMLSpanElement
  )
}
const LanguageIcon: FC<ItmeType> = ({ parent, row, col, hasMyRank }) => {
  const [param] = useUrlChange()
  const [show, setShow] = useState(isShow(parent))

  const params: ParamType = { ...param }
  if (hasMyRank) {
    const username = (window as any).LeetCodeData.userStatus.username
    params.username = username
  }

  const { data: items } = useGetContestQuery(params)
  const iconFile = items?.[row]?.[col]?.iconFile

  useEffect(() => {
    if (!show) return
    setDisplay(parent.children[0]?.children[0], 'none')

    return () => {
      setDisplay(parent.children[0]?.children[0], '')
    }
  }, [show])
  useEffect(() => {
    const handleChange = debounce(() => {
      const show = isShow(parent)
      setShow(show)
      if (show) {
        setDisplay(parent.children[0]?.children[0], 'none')
      }
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
}> = memo(function LanguageIconRow({ row, i, hasMyRank }) {
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
})

export default LanguageIcon
