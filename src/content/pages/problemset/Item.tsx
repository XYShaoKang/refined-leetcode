import {
  FC,
  MouseEventHandler,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { css } from 'styled-components/macro'

import { useAppSelector, useAppDispatch, useHover } from '@/hooks'
import Button from '@/components/Button'
import { ToolTip } from '@/components/ToolTip'
import { rotate360Deg } from '@/components/animation'

import {
  selectFavoriteById,
  checkIsInAudit,
  fetchFavoriteDetails,
} from '../problem-list/favoriteSlice'
import { parseParamsToBody } from './utils'
import { LeetCodeApi, ProblemsetQuestion } from '@/utils'
import { selectQuestonsByOption } from './questionsSlice'
import store from '@/app/store'
import ErrorToolTip from '@/components/ErrorToolTip'

const api = new LeetCodeApi(location.origin)

interface ItemProps {
  idHash: string
  current: boolean
}

const Item: FC<ItemProps> = ({ idHash, current }) => {
  const favorite = useAppSelector(state => selectFavoriteById(state, idHash))
  const dispatch = useAppDispatch()
  const [hoverRef, hover] = useHover()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({ message: '', show: false })

  const [togglePublicStateError, setTogglePublicStateError] = useState({
    message: '',
    show: false,
  })
  const [isOverflow, setIsOverflow] = useState(false)

  const nameRef = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    if (nameRef && nameRef.current) {
      setIsOverflow(nameRef.current.scrollWidth !== nameRef.current.offsetWidth)
    }
  }, [hover])

  useEffect(() => {
    if (togglePublicStateError.show) {
      setTimeout(() => {
        setTogglePublicStateError({ message: '', show: false })
      }, 1000)
    }
  }, [togglePublicStateError])

  useLayoutEffect(() => {
    // 当较快的关闭和展开题单时，会出现题单列表文字被选中的问题
    // 通过「每次展开时，取消对文字的选中效果」解决这个问题
    ;(window as any).getSelection().removeAllRanges()
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    if (favorite?.isInAudit) {
      let time = 1000
      void (async function test() {
        try {
          await dispatch(checkIsInAudit(idHash)).unwrap()
          timer = null
          dispatch(fetchFavoriteDetails([idHash]))
        } catch (error) {
          timer = setTimeout(() => {
            time = Math.max(time + 500, 3000)
            test()
          }, time)
        }
      })()
    }
    return () => {
      if (timer !== null) clearTimeout(timer)
    }
  }, [favorite?.isInAudit])

  useEffect(() => {
    if (error.show) {
      setTimeout(() => {
        setError({ ...error, show: false })
      }, 1000)
    }
  }, [error])

  if (!favorite) return null

  const handleAddQuestions =
    (idHash: string): MouseEventHandler<HTMLButtonElement> =>
    async e => {
      e.stopPropagation()
      e.preventDefault()
      setLoading(true)
      try {
        const body = parseParamsToBody()
        let questions: (ProblemsetQuestion & { questionId?: string })[]

        if (!favorite) {
          throw new Error('题单不存在')
        }

        const { data } = selectQuestonsByOption(store.getState(), {
          ...body,
          skip: 0,
          limit: Infinity,
        })
        questions = data.problemsetQuestionList.questions

        const set = new Set(
          favorite?.questionIds?.map(id => id.toString()) ?? []
        )
        // 排除已经在题单中的题目
        questions = questions.filter(q => !set.has(q.questionId ?? ''))

        const state = store.getState(),
          ids: string[] = []
        for (const question of questions) {
          const q = state.questions.entities[question.frontendQuestionId]
          if (q && q.questionId) {
            ids.push(q.questionId)
          }
        }

        if (ids.length + favorite.questionIds!.length > 200) {
          throw new Error('🐸☕题单题目超出上限: 200')
        }

        await api.addQuestionToFavorite(idHash, ids)
        await dispatch(fetchFavoriteDetails([idHash]))
      } catch (error: any) {
        setError({ message: error.message, show: true })
      } finally {
        setLoading(false)
      }
    }

  const name = favorite.showName ?? favorite.name

  return (
    <li
      css={css`
        padding: 0 4px;
        position: relative;
        display: flex;
        align-items: center;
        margin-top: 6px;
      `}
      ref={hoverRef}
    >
      <div
        css={css`
          width: 100%;
          padding: 5px 12px;
          display: grid;
          grid-template-columns: 32px 1fr;
          column-gap: 8px;
          color: ${props => props.theme.palette.text.light};
          align-items: center;
          &:hover {
            background-color: ${props => props.theme.palette.secondary.hover};
          }
        `}
      >
        <ToolTip title={'包含的题目数量'} arrow={false}>
          <div
            css={css`
              display: flex;
              justify-content: end;
            `}
          >
            <div
              css={css`
                background-color: #9c27b0;
                border-radius: 5px;
                height: 16px;
                line-height: 16px;
                text-align: right;
                padding: 0 2px;
                color: #fff;
              `}
            >
              {favorite.questionIds?.length}
            </div>
          </div>
        </ToolTip>
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: space-between;
            overflow: auto;
            color: ${props => props.theme.palette.text.light};
          `}
        >
          <ToolTip title={name} open={hover && isOverflow}>
            <span
              css={css`
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                position: relative;
              `}
              ref={nameRef}
            >
              {favorite.isInAudit && (
                <span
                  css={css`
                    color: red;
                    border: 1px red solid;
                    border-radius: 50%;
                    display: inline-block;
                    height: 18px;
                    width: 18px;
                    text-align: center;
                    line-height: 18px;
                    transform: translateZ(0);
                    animation: ${rotate360Deg} 10s infinite linear;
                    &:hover {
                      animation: ${rotate360Deg} 1s infinite linear;
                    }
                  `}
                >
                  审
                </span>
              )}
              {name}
            </span>
          </ToolTip>
          <ErrorToolTip error={error}>
            <Button
              css={css`
                && {
                  border-radius: 4px;
                  width: 60px;
                  padding: 2px 0;
                  background-color: ${current ? '' : '#001c3cbd'};
                  color: ${current ? '#d3d3d3' : '#63c0db'};
                  text-align: center;
                  font-size: 12px;
                  &:hover {
                    background-color: ${current ? '' : '#002d60bd;'};
                  }
                }
              `}
              onClick={handleAddQuestions(idHash)}
              disabled={current}
              loading={loading}
            >
              加入
            </Button>
          </ErrorToolTip>
        </div>
      </div>
    </li>
  )
}

export default Item
