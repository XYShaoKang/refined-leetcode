import { css } from 'styled-components/macro'

const HelpHead: React.FC = () => {
  return (
    <div
      css={css`
        padding: 0 4px;
        position: relative;
        display: flex;
        align-items: center;
        margin-top: 6px;
      `}
    >
      <div
        css={css`
          width: 100%;
          padding: 5px 12px;
          display: grid;
          grid-template-columns: [a] 32px [b] 1fr [c] 20px [d] 20px [e] 20px;
          align-items: center;
          color: ${props => props.theme.palette.text.light};
        `}
      >
        <span style={{ gridArea: 'a' }}>图标</span>
        <span style={{ gridArea: 'b', marginLeft: 8 }}>题单名称</span>
        <span style={{ gridArea: 'c' }}>编辑</span>
        <span style={{ gridArea: 'd' }}>删除</span>
        <span style={{ gridArea: 'e' }}>公开</span>
      </div>
    </div>
  )
}

export default HelpHead
