import { FC, useEffect, useRef, useState } from 'react'
import styled from 'styled-components/macro'

const StyleSpan = styled.span`
  position: relative;
  cursor: pointer;
  font-family: 'Glyphicons Halflings';
  font-style: normal;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1;
  top: 1px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  &::before {
    content: '\\e085';
  }
`

const ToolTip = styled.div`
  position: absolute;
  right: -20px;

  &::before {
    box-sizing: content-box;
    content: '';
    display: block;
    height: 0;
    width: 0;
    margin-left: calc(100% - 33px);

    border: 5px solid transparent;
    border-bottom: 5px solid rgba(0, 0, 0, 0.8);
  }
`
const Content = styled.div`
  width: 280px;
  padding: 8px 3px 10px;

  color: #fff;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
`

const useHover = <T extends HTMLElement>() => {
  const ref = useRef<T>(null)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handleMouseOver = (_e: MouseEvent) => {
      setHover(true)

      if (timer !== undefined) {
        clearTimeout(timer)
      }
    }
    const handleMouseOut = (_e: MouseEvent) => {
      timer = setTimeout(() => setHover(false), 300)
    }
    if (ref.current) {
      ref.current.addEventListener('mouseover', handleMouseOver)
      ref.current.addEventListener('mouseout', handleMouseOut)
    }
    return () => {
      if (ref.current) {
        ref.current.removeEventListener('mouseover', handleMouseOver)
        ref.current.removeEventListener('mouseout', handleMouseOut)
      }
    }
  }, [])
  return [ref, hover] as const
}

const Title: FC = () => {
  const [ref, hover] = useHover<HTMLDivElement>()

  return (
    <>
      <span>预测 </span>
      <StyleSpan ref={ref}>
        {hover && (
          <ToolTip>
            <Content>
              预测数据来自
              <a
                href="https://lcpredictor.herokuapp.com/"
                target="_blank"
                rel="noreferrer"
                style={{ paddingLeft: 2 }}
              >
                lcpredictor.herokuapp.com
              </a>
            </Content>
          </ToolTip>
        )}
      </StyleSpan>
    </>
  )
}

export default Title
