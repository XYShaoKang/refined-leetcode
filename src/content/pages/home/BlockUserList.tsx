import React, {
  FC,
  useState,
  ChangeEventHandler,
  KeyboardEventHandler,
  useContext,
  useRef,
} from 'react'
import styled, { ThemeContext } from 'styled-components/macro'

import { Placement, Popper } from '@/components/Popper'
import { ToolTip } from '@/components/ToolTip'
import Button from '@/components/Button'
import { useAppDispatch, useAppSelector } from '@/hooks'

import {
  setBlockUserBySlug,
  selectAllBlockUsers,
  unSetBlockUser,
  toggleBlockUser,
} from './blockUsersSlice'

interface BlockUserListProps {
  placement?: Placement
  anchorEl?: HTMLElement | null
}

const List = styled.ul`
  padding: 0;
  margin: 0;
`

const Item = styled.li`
  list-style: none;
  line-height: 1.42857;
  box-sizing: border-box;
  height: 30px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  font-size: 14px;
  border-radius: 5px;
  padding: 0px 12px;
  font-weight: 400;
  transition: all 0.2s ease 0s;
  cursor: pointer;
  color: ${props => props.theme.palette.text.main};
  &:hover {
    background-color: ${props => props.theme.palette.secondary.hover};
  }
`

const Input = styled.input`
  overflow: visible;
  height: 32px;
  outline: none;
  border-radius: 8px !important;
  box-sizing: border-box;
  margin: 0 10px 0 0;
  width: 100%;
  padding: 4px 11px;
  font-size: 14px;
  line-height: 1.5715;
  border: 1px solid rgba(0, 0, 0, 0);
  transition: all 0.3s;
  touch-action: manipulation;
  text-overflow: ellipsis;
  color: ${props => props.theme.palette.text.main};
  background: ${props => props.theme.palette.secondary.main};
  &:focus {
    background-color: ${props => props.theme.palette.secondary.hover};
  }
`

const Clear = styled.div`
  border-radius: 50%;
  height: 24px;
  width: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: ${props => props.theme.palette.secondary.main};
  }
  & > svg {
    height: 16px;
    width: 16px;
    fill: currentcolor;
  }
`

const BlockUserList: FC<BlockUserListProps> = props => {
  const [slug, setData] = useState<string>('')
  const users = useAppSelector(selectAllBlockUsers)
  const [status, setStatus] = useState('idle')
  const [showToolTip, setShowToolTip] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const dispatch = useAppDispatch()

  const showMessage = (error: string) => {
    hideMessage()
    setErrorMessage(error)
    setShowToolTip(true)
    timer.current = setTimeout(hideMessage, 1000)
  }
  const hideMessage = () => {
    if (timer.current !== undefined) {
      clearTimeout(timer.current)
    }
    setShowToolTip(false)
    setErrorMessage('')
  }

  let width = 0
  if (props.anchorEl) {
    width = props.anchorEl.getClientRects()[0].width
  }
  const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
    setData(e.target.value)
  }
  /** 添加黑名单用户
   *
   * 1. 查找是否已存在对应的用户,如果已存在则不用重复添加
   * 2. 检查 slug 是否有效
   * 3. 将 {slug,name} 存到 LocalStorage 中
   */
  const handleAdd = async () => {
    if (status !== 'idle' || !slug) return
    try {
      setStatus('loading')
      if (users.find(user => user.slug === slug)) {
        showMessage('已存在用户，无需重复添加！')
      } else {
        const res = await dispatch(setBlockUserBySlug(slug)).unwrap()
        if (res) {
          hideMessage()
          setData('')
        } else {
          showMessage('无效的 slug！')
        }
      }
    } catch (error) {
      showMessage(
        (error as { message: string; name: string; stack: string }).message
      )
    } finally {
      setStatus('idle')
    }
  }

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }
  const handleDelete = (slug: string) => {
    dispatch(unSetBlockUser(slug))
  }
  const themeContext = useContext(ThemeContext)

  return (
    <Popper
      {...props}
      style={{
        width,
        borderRadius: 8,
        background: themeContext.palette.primary.light,
      }}
      as="div"
    >
      <div style={{ display: 'flex' }}>
        <ToolTip
          open={showToolTip}
          title={errorMessage}
          arrow={false}
          style={{
            background: 'rgb(22, 11, 11)',
            color: 'rgb(244, 199, 199)',
            display: 'flex',
            whiteSpace: 'nowrap',
          }}
          icon={
            <svg
              viewBox="0 0 24 24"
              style={{
                width: 20,
                height: 20,
                color: 'rgb(244, 67, 54)',
                marginRight: 5,
              }}
            >
              <path
                d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                fill="currentColor"
              />
            </svg>
          }
        >
          <Input
            type="text"
            value={slug}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </ToolTip>
        <ToolTip
          title={!slug ? '请输入 slug' : ''}
          style={{ whiteSpace: 'nowrap' }}
        >
          <div>
            <Button
              onClick={handleAdd}
              disabled={!slug}
              loading={status === 'loading'}
            >
              添加
            </Button>
          </div>
        </ToolTip>
      </div>
      <List style={{ marginTop: users.length ? 10 : 0 }}>
        {users.map(({ slug, name, block }) => (
          <Item key={slug}>
            <div
              style={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <a
                href={`https://leetcode.cn/u/${slug}/`}
                target="__blank"
                style={{ color: 'inherit' }}
              >
                {name}
              </a>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                style={{ width: 30, height: 30 }}
                onClick={() => {
                  dispatch(toggleBlockUser(slug))
                }}
              >
                {block ? (
                  <path
                    d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
                    fill="currentColor"
                    color="rgb(144, 202, 249)"
                  />
                ) : (
                  <path
                    d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
                    fill="currentColor"
                  />
                )}
              </svg>
              <Clear onClick={() => handleDelete(slug)}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </Clear>
            </div>
          </Item>
        ))}
      </List>
    </Popper>
  )
}

export default BlockUserList
