import { StrictMode } from 'react'
import { render } from 'react-dom'
import minimatch from 'minimatch'

import App from './App'

if (minimatch(location.href, 'https://leetcode-cn.com/submissions/detail/**')) {
  window.onload = () => {
    const parent =
      document.querySelectorAll('#lc-header+div')?.[0]?.children?.[0]
    if (parent && parent instanceof HTMLElement) {
      parent.style.display = 'flex'
      parent.style.justifyContent = 'space-between'
      const root = document.createElement('div')
      parent.append(root)

      render(
        <StrictMode>
          <App />
        </StrictMode>,
        root
      )
    }
  }
}

if (minimatch(location.href, 'https://leetcode.com/submissions/detail/**')) {
  window.onload = () => {
    const parent =
      document.getElementById('submission-app')?.children?.[0]?.children?.[0]

    if (parent && parent instanceof HTMLElement) {
      parent.style.display = 'flex'
      parent.style.justifyContent = 'space-between'
      const root = document.createElement('div')
      parent.append(root)

      render(
        <StrictMode>
          <App />
        </StrictMode>,
        root
      )
    }
  }
}
