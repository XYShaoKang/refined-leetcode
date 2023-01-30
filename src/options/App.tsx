import React, { FC } from 'react'
import { css } from 'styled-components/macro'
import Option from './Option'

const App: FC = () => {
  return (
    <div
      css={css`
        height: 100vh;
        background: #191919;
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <Option />
    </div>
  )
}

export default App
