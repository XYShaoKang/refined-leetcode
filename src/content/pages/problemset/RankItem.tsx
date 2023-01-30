import { FC, useEffect, useState } from 'react'

import { useAppSelector } from '@/hooks'

import { selectProblemRankDataByTitleSlug } from '../global/globalSlice'
import { css } from 'styled-components/macro'

interface RankProps {
  row: HTMLElement
}

const color = (rating: number, themeMode: 'dark' | 'light') => {
  let res: { dark: string; light: string }
  if (rating < 1200) {
    // Newbie
    res = { dark: '#808080', light: '#808080' }
  } else if (rating < 1400) {
    // Pupil
    res = { dark: '#008000', light: '#008000' }
  } else if (rating < 1600) {
    // Specialist
    res = { dark: '#03a89e', light: '#03a89e' }
  } else if (rating < 1900) {
    // Expert
    res = { dark: '#008ed3', light: '#00f' }
  } else if (rating < 2100) {
    // Candidate Master
    res = { dark: '#a0a', light: '#a0a' }
  } else if (rating < 2300) {
    // Master
    res = { dark: '#dbaf75', light: '#dbaf75' }
  } else if (rating < 2400) {
    // International Master
    res = { dark: '#dba049', light: '#dba049' }
  } else if (rating < 2600) {
    // Grandmaster
    res = { dark: '#db6666', light: '#db6666' }
    // } else if (rating < 3000) {
    //   // International Grandmaster
    //   return '#FF0000'
  } else {
    // Legendary Grandmaster
    res = { dark: '#c70000', light: '#FF0000' }
  }
  return res[themeMode]
}

const RankItem: FC<RankProps> = ({ row }) => {
  const getTitleSlug = () =>
    row.children[1]
      ?.querySelector('a')
      ?.pathname.split('/')
      .filter(Boolean)[1] ?? ''
  const [titleSlug, setTitleSlug] = useState(getTitleSlug())
  const rank = useAppSelector(state =>
    selectProblemRankDataByTitleSlug(state, titleSlug)
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const titleSlug = getTitleSlug()
      if (titleSlug) {
        setTitleSlug(titleSlug)
      }
    })
    observer.observe(row.children[1], { childList: true })
    return () => {
      observer.disconnect()
    }
  }, [])

  if (!rank) return null

  return (
    <div
      css={css`
        color: ${props => color(rank.Rating, props.theme.mode)};
        font-weight: bold;
        text-align: center;
        ${rank.Rating >= 3000
          ? css`
              &::first-letter {
                color: ${props =>
                  props.theme.mode === 'dark' ? '#fff' : '#000'};
              }
            `
          : ''}
      `}
    >
      {rank?.Rating.toFixed(0) ?? ''}
    </div>
  )
}

export default RankItem
