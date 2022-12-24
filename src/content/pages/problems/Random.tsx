import { FC, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components/macro'

import { LeetCodeApi, ProblemsetQuestion, QuestionType } from '@/utils'
import { withRoot } from '@/hoc'
import { useAppSelector, useHover } from '@/hooks'

import { selectIsPremium } from '../global/globalSlice'
import { selectRandomOption } from '../global/optionSlice'
import RandomOption from './RandomOption'

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
  const isPremium = useAppSelector(selectIsPremium)
  const [favorite, setFavorite] = useState(
    new URL(location.href).searchParams.get('favorite') ?? 'all'
  )
  const [hoverRef, hover] = useHover(100)
  const [hoverOptionRef, hoverOption] = useHover(100)
  const ref = useRef<HTMLButtonElement>()
  const mulRef = useCallback(el => {
    ref.current = el
    hoverRef(el)
  }, [])
  const option = useAppSelector(state => selectRandomOption(state, favorite))

  useEffect(() => {
    const handle = () => {
      setFavorite(new URL(location.href).searchParams.get('favorite') ?? 'all')
    }

    window.addEventListener('urlchange', handle)
    return () => window.removeEventListener('urlchange', handle)
  }, [])

  const handldClick = async () => {
    let allQuestions: {
      titleSlug: string
      paidOnly?: boolean
      isPaidOnly?: boolean
    }[]

    const currentTitleSlug = location.pathname.split('/').filter(Boolean)[1]
    const predicates: ((question: any) => boolean | undefined)[] = []
    // 过滤当前题目
    predicates.push(({ titleSlug }) => titleSlug === currentTitleSlug)
    if (favorite !== 'all') {
      allQuestions = await api.getProblemsetQuestionList(favorite)
      type Question = ProblemsetQuestion['questions']['0']
      // 过滤会员题
      predicates.push(({ paidOnly }: Question) => !isPremium && paidOnly)
      // 过滤已  AC 的题目
      predicates.push(
        ({ status }: Question) => option.skipAC && status === 'AC'
      )
    } else {
      allQuestions = await api.getAllQuestions()
      type Question = QuestionType
      // 过滤会员题
      predicates.push(({ isPaidOnly }: Question) => !isPremium && isPaidOnly)
      // 过滤已  AC 的题目
      predicates.push(
        ({ status }: Question) => option.skipAC && status === 'ac'
      )
    }
    allQuestions = allQuestions.filter(
      question => !predicates.some(f => f(question))
    )

    if (!allQuestions.length) return

    const i = Math.floor(Math.random() * (allQuestions.length - 1))

    let nextUrl = `/problems/${allQuestions[i].titleSlug}/`
    if (favorite !== 'all') nextUrl += `?favorite=${favorite}`
    ;(window as any).next.router.push(nextUrl)
  }

  return (
    <>
      <StyledBtn onClick={handldClick} ref={mulRef}>
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
      {(hover || hoverOption) && (
        <RandomOption
          favorite={favorite}
          anchorEl={ref.current}
          ref={hoverOptionRef}
        />
      )}
    </>
  )
}

export default withRoot(Random)
