import { render, unmountComponentAtNode } from 'react-dom'

import { findElement } from '@/utils'

import App from '../problem-list/App'

let _root: HTMLDivElement | null = null

async function mount() {
  const selector =
    '#__next > div > div.w-full > div > div:nth-child(2) > div:nth-child(3)'
  const el = await findElement(
    selector,
    el => el?.children[0]?.children[0]?.textContent === '精选题单'
  )

  _root = document.createElement('div')
  el.parentNode?.insertBefore(_root, el)

  render(<App />, _root)
}

function unmount() {
  if (_root) {
    if (_root) unmountComponentAtNode(_root)
    _root.remove()
    _root = null
  }
}

void (async function main() {
  if (location.pathname === '/problemset/all/') {
    mount()
  }
})()

window.addEventListener('urlchange', async function () {
  if (location.pathname === '/problemset/all/') {
    if (!_root) {
      mount()
    }
  } else {
    unmount()
  }
})
