import { render, unmountComponentAtNode } from 'react-dom'

import { awaitFn, findElementByXPath, pageIsLoad, sleep } from '@/utils'

import App from './App'
import { fixRandom } from './fixRandom'
import RankApp from '../problemset/App'

let _root: HTMLDivElement | null = null,
  rankTitle: HTMLDivElement | null = null

function getListEl() {
  return findElementByXPath(
    '//*[@id="__next"]/*//span[text()="精选题单"]/../..'
  )
}

async function mount() {
  const el = await getListEl()
  if (_root) return

  _root = document.createElement('div')
  el.parentNode?.insertBefore(_root, el)

  render(<App />, _root)

  const tableEl = await findElementByXPath('//div[@role="table"]')

  const titleRow = tableEl.children[0]?.children[0]?.children[0]
  const width = 90
  if (!rankTitle && titleRow) {
    rankTitle = document.createElement('div')
    rankTitle.setAttribute(
      'style',
      `
        box-sizing: border-box;
        flex: ${width} 0 auto;
        min-width: 0px;
        width: ${width + 16}px;
        cursor: pointer;
        `
    )
    render(
      <RankApp tableEl={tableEl} width={width} root={rankTitle} />,
      rankTitle
    )
    titleRow.append(rankTitle)
  }
}

function unmount() {
  if (_root) {
    unmountComponentAtNode(_root)
    _root.remove()
    _root = null
  }
  if (rankTitle) {
    unmountComponentAtNode(rankTitle)
    rankTitle.remove()
    rankTitle = null
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
    await getListEl()
    await Promise.race([
      sleep(500),
      findElementByXPath('//span[text()="分享"]'),
    ])
    // 等待跳转到题单页，通过判断「导航栏的题单按钮是否取消高亮」
    await awaitFn(async () => !(await pageIsLoad('题库')))
    mount()
    fixRandom()
  } else {
    unmount()
  }
})
