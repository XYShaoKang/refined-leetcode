import React, { FC, useEffect, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components/macro'

import { getTheme, LeetCodeApi } from '../../utils'
import { darkTheme, lightTheme } from '../../theme'

const StyledBtn = styled.button`
  line-height: 0;
  color: ${props =>
    props.theme.mode === 'dark' ? 'rgb(219 219 219)' : 'rgb(38 38 38)'};
  & > svg {
    height: 18px;
    width: 18px;
  }
`

const api = new LeetCodeApi(location.origin)

const Random: FC = () => {
  const [theme, setTheme] = useState(getTheme())
  useEffect(() => {
    // 跟随力扣的明暗主题进行切换
    const observer = new MutationObserver(mutationList => {
      if (mutationList.some(record => record.attributeName === 'class')) {
        if (document.documentElement.classList.contains('dark')) {
          setTheme(darkTheme)
        } else {
          setTheme(lightTheme)
        }
      }
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => {
      observer.disconnect()
    }
  }, [])

  const handldClick = async () => {
    const allQuestions = await api.getAllQuestions()
    let i = Math.floor(Math.random() * (allQuestions.length - 1))
    if (allQuestions[i].titleSlug === location.pathname.split('/')[1]) {
      i = allQuestions.length - 1
    }
    ;(window as any).next.router.push(`/problems/${allQuestions[i].titleSlug}/`)
  }
  return (
    <ThemeProvider theme={theme}>
      <StyledBtn onClick={handldClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="1em"
          height="1em"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18.48 17.5h-2.204a5 5 0 01-4.31-2.466l-.625-1.061-.624 1.061a5 5 0 01-4.31 2.466H2.661a1 1 0 110-2h3.746a3 3 0 002.586-1.48L10.181 12 8.993 9.98A3 3 0 006.407 8.5H2.661a1 1 0 110-2h3.746a5 5 0 014.31 2.466l.624 1.061.624-1.061a5 5 0 014.31-2.466h2.205V4.315a.5.5 0 01.874-.332l2.536 2.853a1 1 0 010 1.328l-2.536 2.853a.5.5 0 01-.874-.332V8.5h-2.204a3 3 0 00-2.587 1.48L12.501 12l1.188 2.02a3 3 0 002.587 1.48h2.204v-2.185a.5.5 0 01.874-.332l2.83 3.185a.5.5 0 010 .664l-2.83 3.185a.5.5 0 01-.874-.332V17.5z"
            clipRule="evenodd"
          />
        </svg>
      </StyledBtn>
    </ThemeProvider>
  )
}

export default Random
