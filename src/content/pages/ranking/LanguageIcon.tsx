import { FC, memo, useEffect, useState } from 'react'
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
  return parent.textContent && !!parent.textContent.trim()
}

const LanguageIcon: FC<ItmeType> = ({ parent, lang }) => {
  const [show, setShow] = useState(isShow(parent))
  const { data: iconFiles } = useGetFileIconsQuery()

  useEffect(() => {
    const handleChange = debounce(() => {
      const show = isShow(parent)
      setShow(show)
      if (show) {
        if (parent.childNodes[0].nodeName === 'A') {
          setDisplay(parent.children[0]?.children[0], 'none')
        }
      }
    }, 10)
    handleChange()
    const observer = new MutationObserver(handleChange)
    observer.observe(parent, { childList: true })
    return () => {
      handleChange.cancel()
      observer.disconnect()
      setDisplay(parent.children[0]?.children[0], '')
    }
  }, [])

  if (!show || !lang || !iconFiles) return null

  if (parent.childNodes[0]?.nodeName === '#text') {
    // 当前处于比赛中，则需要手动创建一个元素用于图标的渲染
    const span = document.createElement('span')
    parent.insertBefore(span, parent.childNodes[0])
  }

  const iconFile = iconFiles[lang]
  return (
    <Portal container={parent.children[0] as HTMLElement}>
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
}> = memo(function LanguageIconRow({ contestSlug, row, i, hasMyRank }) {
  const { username, region } = useUser(hasMyRank, i, row)

  const user = useAppSelector(state =>
    selectUserRanking(state, contestSlug, region, username)
  )
  const contestInfo = useAppSelector(state =>
    selectContestInfo(state, contestSlug)
  )

  if (!user || !contestInfo) return null
  const { questions } = contestInfo
  const tds = Array.prototype.slice.call(row.children, 4, 8)
  return (
    <>
      {tds.map((td, j) => (
        <LanguageIcon
          key={j}
          parent={td}
          lang={user.submission[questions[j].question_id]?.lang}
        />
      ))}
    </>
  )
})

export default LanguageIcon
