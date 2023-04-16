import { FC, ReactNode } from 'react'
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
  color: #fff;
  text-align: center;
  white-space: nowrap;
`

const Help = ({ content }: { content: string | ReactNode }) => {
  return (
    <ToolTip
      placement="left"
      arrow={false}
      keep={true}
      title={<Content>{content}</Content>}
      offset={{ left: 70, top: 40 }}
    >
      <HelpIcon />
    </ToolTip>
  )
}

interface TitleProps {
  showOldRating: boolean
  showPredictordelta: boolean
  showNewRating: boolean
  showExpectingRanking: boolean
  realTime: boolean
  help?: string | ReactNode
}

const Title: FC<TitleProps> = ({
  showNewRating,
  showPredictordelta,
  showOldRating,
  showExpectingRanking,
  realTime,
  help,
}) => {
  return (
    <>
      <div
        style={{
          display: 'flex',
        }}
      >
        {showOldRating && (
          <div style={{ width: 60 }}>
            旧分数
            {!showPredictordelta && !showNewRating && help && (
              <Help content={help} />
            )}
          </div>
        )}
        {showPredictordelta && (
          <div
            style={{
              width: 55,
              paddingLeft: showNewRating ? 10 : 0,
            }}
          >
            <span>{showNewRating ? 'Δ' : '预测'}</span>
            {!showNewRating && help && <Help content={help} />}
          </div>
        )}

        {showNewRating && (
          <div style={{ width: 70 }}>
            新分数
            {help && <Help content={help} />}
          </div>
        )}

        {showExpectingRanking && realTime && <div>期望全球排名</div>}
      </div>
    </>
  )
}

export default Title
