import { StrictMode } from 'react'
import { render } from 'react-dom'
import { createGlobalStyle } from 'styled-components/macro'

import App from './App'

__webpack_public_path__ = chrome.runtime.getURL('.') + '/'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`

render(
  <StrictMode>
    <GlobalStyle />
    <App />
  </StrictMode>,
  document.getElementById('root')
)
