import React, { FC, useEffect, useRef, useState } from 'react'
import styled from 'styled-components/macro'

import BlockUserList from './BlockUserList'

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
  const [showEdit, setShowEdit] = useState(false)
  const handleClick = () => {
    setShowEdit(state => !state)
  }
  useEffect(() => {
    const handleScroll = () => setShowEdit(false)
    document.body.addEventListener('scroll', handleScroll)
  }, [])
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
      {showEdit && <BlockUserList placement="bottom" anchorEl={ref.current} />}
    </>
  )
}

export default BlockUser
