import { StrictMode } from 'react'
import { render } from 'react-dom'

import Clock from './Clock'
import { getElement } from '../../utils'

async function load() {
  const parent = (await getElement('.container__Kjnx>.action__KaAP'))[0]
  if (parent && parent instanceof HTMLElement) {
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

if (/https:\/\/leetcode-cn\.com\/problems\//.test(location.href)) {
  load()
}
