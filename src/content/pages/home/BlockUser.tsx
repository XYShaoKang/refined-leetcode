import React, { FC, useEffect, useRef, useState } from 'react'
import styled from 'styled-components/macro'

import BlockUserList from './BlockUserList'
import DragAndDrop from './DragAndDrop'

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  width: 100%;
  padding: 5px 16px;
  border-radius: 8px;
  box-sizing: border-box;
  cursor: pointer;
  line-height: 20px;
  background: ${props => props.theme.palette.primary.main};
  color: ${props => props.theme.palette.text.main};
  box-shadow: ${props => props.theme.shadows[1]};
`

const BlockUser: FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [showEdit, setShowEdit] = useState(false)
  const handleClick = () => {
    setShowEdit(state => !state)
  }
  useEffect(() => {
    // 滚动页面时，隐藏黑名单列表窗口
    const handleScroll = () => setShowEdit(false),
      option: AddEventListenerOptions = { passive: true }
    document.body.addEventListener('scroll', handleScroll, option)
    return () => {
      document.body.removeEventListener('scroll', handleScroll, option)
    }
  }, [])

  useEffect(() => {
    if (!showEdit) return
    const handleClick = (e: MouseEvent) => {
      const el = e.target as Node
      if (!el) return
      if (ref.current?.contains(el) || listRef.current?.contains(el)) return
      setShowEdit(false)
    }
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [showEdit])

  return (
    <>
      <Container ref={ref} onClick={handleClick}>
        <div>黑名单管理</div>
        <svg
          viewBox="0 0 24 24"
          style={{
            height: 25,
            fill: 'currentColor',
            transform: showEdit ? 'rotate3d(0, 0, 1, 180deg)' : '',
          }}
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </Container>
      {showEdit && (
        <BlockUserList
          placement="bottom"
          anchorEl={ref.current}
          ref={listRef}
        />
      )}

      <DragAndDrop />
    </>
  )
}

export default BlockUser
