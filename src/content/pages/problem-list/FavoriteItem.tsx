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
import { routerTo } from '@/utils'
import {
  EditIcon,
  PrivateIcon,
  PublicIcon,
  RemoveIcon,
} from '@/components/icons'

const DEFAULT_COVER =
  'https://static.leetcode.cn/cn-frontendx-assets/production/_next/static/images/default-logo-5a15811cf52298855a46a3f400663063.png'
const DEFAULT_FAVORITE_NAME = 'Favorite'

interface FavoriteItemProps {
  idHash: string
  current: boolean
  showEditIcon?: boolean
}

const FavoriteItem: FC<FavoriteItemProps> = ({
  idHash,
  current,
  showEditIcon,
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
      routerTo(`/problem-list/${idHash}/`)
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
  const toggleEnableEdit: (e?: React.MouseEvent) => void = e => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
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
  const toggleShowRemove: (e?: React.MouseEvent) => void = e => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
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
          align-items: center;
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
          {showEditIcon && (
            <div
              css={css`
                display: flex;
                column-gap: 2px;
                align-items: center;
              `}
            >
              {hover &&
                favorite.name !== DEFAULT_FAVORITE_NAME &&
                !favorite.isInAudit && (
                  <>
                    <EditIcon
                      height={20}
                      css={'grid-area: a;'}
                      onClick={toggleEnableEdit}
                    />
                    <RemoveIcon
                      height={20}
                      css={'grid-area: b;'}
                      color="#d05451"
                      onClick={toggleShowRemove}
                    />
                  </>
                )}

              <ErrorToolTip
                error={togglePublicStateError}
                css={css`
                  transform: translate(-88%, calc(-100% - 10px));
                `}
              >
                <div
                  onClick={handleToggleFavoritePublicState}
                  css={' grid-area: c;'}
                >
                  {favorite.isPublicFavorite ? (
                    <PublicIcon height={20} />
                  ) : (
                    <PrivateIcon height={20} />
                  )}
                </div>
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
