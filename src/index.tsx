import { StrictMode } from 'react'
import { render } from 'react-dom'
import minimatch from 'minimatch'

import Download from './page/submissions-detail/Download'
import Clock from './page/problems/Clock'
import { getElement } from './utils'

function loadDownload(parent: Element) {
  if (parent && parent instanceof HTMLElement) {
    parent.style.display = 'flex'
    parent.style.justifyContent = 'space-between'
    const root = document.createElement('div')
    parent.append(root)

    render(
      <StrictMode>
        <Download />
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

if (minimatch(location.href, 'https://leetcode-cn.com/problems/**')) {
  window.onload = async () => {
    const parent = (await getElement('.container__Kjnx>.action__KaAP'))[0]
    if (parent && parent instanceof HTMLElement) {
      console.log(parent)
      const root = document.createElement('div')
      parent.prepend(root)
      root.style.display = 'flex'
      root.style.alignItems = 'center'
      root.style.flexShrink = '0'

      render(
        <StrictMode>
          <Clock />
        </StrictMode>,
        root
      )
    }
  }
}
