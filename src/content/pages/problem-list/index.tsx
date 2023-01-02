import { render, unmountComponentAtNode } from 'react-dom'

import { findElement } from '@/utils'

import App from './App'
import { fixRandom } from './fixRandom'

let _root: HTMLDivElement | null = null

async function mount() {
  const selector =
    '#__next > div > div.w-full > div > div:nth-child(2) > div > div:nth-child(2)'
  const el = await findElement(
    selector,
    el => el?.children[0]?.textContent === '精选题单'
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

const isProblemList = () => {
  const str = location.pathname.split('/').filter(Boolean)
  if (str[0] === 'problem-list') {
    return true
  }
  return false
}
void (async function main() {
  if (isProblemList()) {
    mount()
    fixRandom()
  }
})()

window.addEventListener('urlchange', async function () {
  if (isProblemList()) {
    if (!_root) {
      mount()
      fixRandom()
    }
  } else {
    unmount()
  }
})
