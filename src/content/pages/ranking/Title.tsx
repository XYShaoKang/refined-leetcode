import { FC } from 'react'
import styled from 'styled-components/macro'
import { withRoot } from '../../hoc'

import { useHover } from '../hooks'

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
  z-index: 10;

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
  width: 200px;
  padding: 8px 3px 10px;

  color: #fff;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
`

const Title: FC = () => {
  const [ref, hover] = useHover<HTMLDivElement>(300)

  return (
    <>
      <span>预测 </span>
      <StyleSpan ref={ref}>
        {hover && (
          <ToolTip>
            <Content>
              预测数据来自
              <a
                href="https://lccn.lbao.site/"
                target="_blank"
                rel="noreferrer"
                style={{ paddingLeft: 2 }}
              >
                lccn.lbao.site
              </a>
            </Content>
          </ToolTip>
        )}
      </StyleSpan>
    </>
  )
}

export default withRoot(Title)
