import { FC } from 'react'
import styled from 'styled-components/macro'

import { ToolTip } from '@/components/ToolTip'

const HelpIcon = styled.span`
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

const Content = styled.div`
  width: 175px;
  color: #fff;
  text-align: center;
`

const Help = () => {
  return (
    <ToolTip
      placement="bottom"
      arrow={true}
      title={
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
      }
    >
      <HelpIcon />
    </ToolTip>
  )
}

interface TitleProps {
  showNewRating: boolean
  showPredictordelta: boolean
}

const Title: FC<TitleProps> = ({ showNewRating, showPredictordelta }) => {
  return (
    <>
      <div
        style={{
          display: 'flex',
        }}
      >
        {showPredictordelta && (
          <div style={{ width: 55 }}>
            <span>预测</span>
            <Help />
          </div>
        )}

        {showNewRating && <div>新分数{!showPredictordelta && <Help />}</div>}
      </div>
    </>
  )
}

export default Title
