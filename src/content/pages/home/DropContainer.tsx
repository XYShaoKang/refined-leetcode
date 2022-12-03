import React, { FC } from 'react'
import styled from 'styled-components/macro'
import { ConnectDropTarget } from 'react-dnd'
import { Portal } from '../components/Portal'

const Container = styled.div<{ active?: boolean }>`
  position: fixed;
  right: 50px;
  top: 50%;
  width: 100px;
  height: 150px;
  background: ${props => (props.active ? '#3cb97f' : '#49ab7e')};
  transform: translate(0, -50%);
  color: white;
  border-radius: 5px;
  padding: 4px;
  z-index: 9999;
`

const SVG = styled.svg`
  height: 1em;
  fill: currentcolor;
  font-size: 1.5rem;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
`

type BlockDropContainerProps = {
  drop: ConnectDropTarget
  active?: boolean
}

const DropContainer: FC<BlockDropContainerProps> = ({ drop, active }) => {
  return (
    <Portal>
      <Container ref={drop} active={active}>
        拖动到此
        <br />
        加入黑名单
        <SVG viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" />
        </SVG>
      </Container>
    </Portal>
  )
}

export default DropContainer
