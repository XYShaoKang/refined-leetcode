import { FC, memo, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components/macro'

import { debounce } from '../../../utils'

import {
  selectUserRanking,
  selectContestInfo,
  useGetFileIconsQuery,
} from './rankSlice'
import { Portal } from '@/components/Portal'
import { useAppSelector } from '@/hooks'
import { useUser } from './utils'

type ItmeType = {
  parent: HTMLElement
  lang?: string
  beta?: boolean
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
  if (el instanceof HTMLElement || el instanceof SVGElement) {
    el.style.display = display
  }
}
function isShow(parent: HTMLElement) {
  return parent.textContent && !!parent.textContent.trim()
}

const LanguageIcon: FC<ItmeType> = ({ parent, lang, beta }) => {
  const [show, setShow] = useState(isShow(parent))
  const { data: iconFiles } = useGetFileIconsQuery()

  useEffect(() => {
    const p = beta ? parent.children[0].children[0] : parent.children[0]
    const handleChange = debounce(() => {
      const show = isShow(parent)
      setShow(show)
      if (show) {
        if (p?.nodeName !== 'DIV') {
          setDisplay(p?.children[0], 'none')
        }
      }
    }, 10)
    handleChange()
    const observer = new MutationObserver(handleChange)
    observer.observe(parent, { childList: true })
    return () => {
      handleChange.cancel()
      observer.disconnect()
      setDisplay(p?.children[0], '')
    }
  }, [beta])

  if (!show || !lang || !iconFiles) return null
  if (parent.childNodes[0]?.nodeName === '#text') {
    // 当前处于比赛中，则需要手动创建一个元素用于图标的渲染
    const span = document.createElement('span')
    parent.insertBefore(span, parent.childNodes[0])
    span.style.display = 'inline-block'
  }

  const iconFile = iconFiles[lang]
  return (
    <Portal
      container={
        beta
          ? (parent.children[0].children[0] as HTMLElement)
          : (parent.children[0] as HTMLElement)
      }
    >
      {!iconFile ? (
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
  contestSlug: string
  row: HTMLElement
  i: number
  hasMyRank: boolean
  beta?: boolean
}> = memo(function LanguageIconRow({ contestSlug, row, i, hasMyRank, beta }) {
  const { username, region } = useUser(hasMyRank, i, row, beta)

  const user = useAppSelector(state =>
    selectUserRanking(state, contestSlug, region, username)
  )
  const contestInfo = useAppSelector(state =>
    selectContestInfo(state, contestSlug)
  )

  const tds = useMemo(() => {
    if (beta) {
      return Array.prototype.slice.call(row.children, 3, 7)
    }
    return Array.prototype.slice.call(row.children, 4, 8)
  }, [beta, row])

  if (!user || !contestInfo) return null

  const { questions } = contestInfo

  return (
    <>
      {tds.map((td, j) => (
        <LanguageIcon
          key={j}
          parent={td}
          lang={user.submission[questions[j].question_id]?.lang}
          beta={beta}
        />
      ))}
    </>
  )
})

export default LanguageIcon
