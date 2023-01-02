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
import Modal from '@/components/Modal'
import ErrorToolTip from '@/components/ErrorToolTip'
import { ToolTip } from '@/components/ToolTip'
import { rotate360Deg } from '@/components/animation'

import {
  selectFavoriteById,
  removeFavorite,
  toggleFavoritePublicState,
  updateFavoriteName,
  checkIsInAudit,
  fetchFavoriteDetails,
} from './favoriteSlice'
import Editor from './Editor'

const DEFAULT_COVER =
  'https://static.leetcode.cn/cn-frontendx-assets/production/_next/static/images/default-logo-5a15811cf52298855a46a3f400663063.png'
const DEFAULT_FAVORITE_NAME = 'Favorite'

interface FavoriteItemProps {
  idHash: string
  current: boolean
  isCustom: boolean
  hoverHelp: boolean
}

const FavoriteItem: FC<FavoriteItemProps> = ({
  idHash,
  current,
  isCustom,
  hoverHelp: showEditBtn,
}) => {
  const favorite = useAppSelector(state => selectFavoriteById(state, idHash))
  const dispatch = useAppDispatch()
  const [hoverRef, hover] = useHover()
  const [enableEdit, setEnableEdit] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
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

  if (!favorite) return null

  const handleClick: MouseEventHandler = e => {
    e.preventDefault()
    if (!current) {
      ;(window as any).next.router.push(
        `https://leetcode.cn/problem-list/${idHash}/`
      )
    }
  }
  const handleRemove: MouseEventHandler = async e => {
    e.stopPropagation()
    e.preventDefault()
    dispatch(removeFavorite(idHash))
  }
  const handleToggleFavoritePublicState: MouseEventHandler = async e => {
    e.stopPropagation()
    e.preventDefault()
    if (favorite.isInAudit) {
      setTogglePublicStateError({
        message: '题单处于审核中，不可编辑',
        show: true,
      })
      return
    }

    try {
      await dispatch(toggleFavoritePublicState(idHash)).unwrap()
    } catch (error: any) {
      setTogglePublicStateError({ message: error.message, show: true })
    }
  }
  const toggleEnableEdit: () => void = () => {
    setEnableEdit(enableEdit => !enableEdit)
  }
  const updateName = async (name: string) => {
    if (favorite.isInAudit) {
      throw new Error('题单处于审核中，不可编辑')
    }

    await dispatch(
      updateFavoriteName({ favoriteId: favorite!.idHash, name })
    ).unwrap()
    dispatch(fetchFavoriteDetails([idHash]))
    toggleEnableEdit()
  }
  const toggleShowRemove: () => void = () => {
    setShowRemove(showRemove => !showRemove)
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
      {current && (
        <div
          css={css`
            position: absolute;
            left: 0;
            height: 18px;
            width: 4px;
            background-color: rgb(10 132 255);
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
          `}
        />
      )}
      <a
        href={`/problem-list/${idHash}/`}
        css={css`
          width: 100%;
          padding: 5px 12px;
          display: grid;
          grid-template-columns: 32px 1fr;
          column-gap: 8px;
          color: ${props => props.theme.palette.text.light};
          &:hover {
            background-color: ${props => props.theme.palette.secondary.hover};
          }
        `}
        onClick={handleClick}
      >
        <img
          src={favorite.coverUrl ?? DEFAULT_COVER}
          alt={name}
          height="32"
          width="32"
          css={css`
            border-radius: 5px;
            user-select: none;
          `}
        />
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
          {isCustom && (
            <div
              css={css`
                display: flex;
                column-gap: 2px;
                align-items: center;
              `}
            >
              {(hover || showEditBtn) &&
                favorite.name !== DEFAULT_FAVORITE_NAME &&
                !favorite.isInAudit && (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      css={css`
                        width: 20px;
                        height: 20px;
                        grid-area: a;
                      `}
                      onClick={e => {
                        e.stopPropagation()
                        e.preventDefault()
                        toggleEnableEdit()
                      }}
                    >
                      <path
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                        fill="currentColor"
                      />
                    </svg>
                    <svg
                      viewBox="0 0 24 24"
                      fill="#d05451"
                      onClick={e => {
                        e.stopPropagation()
                        e.preventDefault()
                        toggleShowRemove()
                      }}
                      css={css`
                        width: 20px;
                        height: 20px;
                        grid-area: b;
                      `}
                    >
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12 1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </>
                )}

              <ErrorToolTip
                error={togglePublicStateError}
                css={css`
                  transform: translate(-88%, calc(-100% - 10px));
                `}
              >
                <svg
                  viewBox="0 0 24 24"
                  onClick={handleToggleFavoritePublicState}
                  css={css`
                    width: 20px;
                    height: 20px;
                    grid-area: c;
                  `}
                >
                  {favorite.isPublicFavorite ? (
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                      fill="currentColor"
                    />
                  ) : (
                    <path
                      d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                      fill="currentColor"
                    />
                  )}
                </svg>
              </ErrorToolTip>
            </div>
          )}
        </div>
      </a>
      {enableEdit && (
        <Modal open={enableEdit} onClose={toggleEnableEdit}>
          <div
            css={css`
              box-shadow: ${props => props.theme.shadows[2]};
              background-color: ${props => props.theme.palette.primary.main};
              border-radius: 8px;
              padding: 1px 20px 15px;
            `}
          >
            <div
              css={css`
                margin: 10px 0;
                font-size: 16px;
                font-weight: bold;
              `}
            >
              修改题单名称
            </div>
            <Editor
              text={name}
              onCancel={toggleEnableEdit}
              onSave={updateName}
            />
          </div>
        </Modal>
      )}
      {showRemove && (
        <Modal open={showRemove} onClose={toggleShowRemove}>
          <div
            css={css`
              box-shadow: ${props => props.theme.shadows[2]};
              background-color: ${props => props.theme.palette.primary.main};
              border-radius: 8px;
              padding: 1px 20px 15px;
              min-width: 400px;
            `}
          >
            <div
              css={css`
                margin: 10px 0;
                font-size: 16px;
                font-weight: bold;
              `}
            >
              你确认要删除题单“{name}”吗？
            </div>
            <div>删除此列表后，将无法再恢复</div>
            <div
              css={css`
                display: flex;
                justify-content: flex-end;
                margin-top: 20px;
              `}
            >
              <Button
                css={css`
                  && {
                    height: 24px;
                    background-color: #555;
                    &:hover {
                      background-color: #444;
                    }
                  }
                `}
                onClick={toggleShowRemove}
              >
                取消
              </Button>
              <Button
                css={css`
                  && {
                    height: 24px;
                    margin-left: 10px;
                    background-color: #d05451;
                    &:hover {
                      background-color: #d05351ac;
                    }
                  }
                `}
                onClick={handleRemove}
              >
                删除
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </li>
  )
}

export default FavoriteItem
