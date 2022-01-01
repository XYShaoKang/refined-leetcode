import { StrictMode } from 'react'
import { render } from 'react-dom'
import minimatch from 'minimatch'

import App from './App'
import { getElement } from './utils'

function loadDownload(parent: Element) {
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

if (minimatch(location.href, 'https://leetcode-cn.com/submissions/detail/**')) {
  window.onload = async () => {
    const main = await getElement('.css-smuvek-Main')
    loadDownload(main[0]?.children?.[0])
  }
}

if (minimatch(location.href, 'https://leetcode.com/submissions/detail/**')) {
  window.onload = async () => {
    const parent = await getElement('#submission-app>.row>div:first-child')
    loadDownload(parent[0])
  }
}
