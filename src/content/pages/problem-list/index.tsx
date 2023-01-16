import { render, unmountComponentAtNode } from 'react-dom'

import {
  autoMount,
  awaitFn,
  findElementByXPath,
  pageIsLoad,
  sleep,
} from '@/utils'

import App from './App'
import { fixRandom, removeFixRandom } from './fixRandom'
import RankApp from '../problemset/App'

let _root: HTMLDivElement | null = null,
  rankTitle: HTMLDivElement | null = null

function getListEl() {
  return findElementByXPath(
    '//*[@id="__next"]/*//span[text()="精选题单"]/../..'
  )
}

const [mountProblemList, unmountProblemList] = autoMount(
  '//*[@id="__next"]/*//span[text()="精选题单"]/../..',
  async () => {
    const el = await getListEl()
    if (_root) {
      if (_root?.nextElementSibling === el) return
      // 可能因为加载比较慢之类的原因，导致自定义题单的侧边栏已经加载而其他的一些元素还没加载，
      // 而等之后其他元素加载完成之后，可能会导致自定义题单的位置出现在很奇怪的位置，就需要重新去加载一下。
      unmountComponentAtNode(_root)
      _root.remove()
      _root = null
    }

    _root = document.createElement('div')
    el.parentNode?.insertBefore(_root, el)
    render(<App />, _root)
  },
  els => els[0].parentElement
)

async function mount() {
  mountProblemList()
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
  removeFixRandom()
  unmountProblemList()

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
