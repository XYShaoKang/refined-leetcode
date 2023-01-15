import { render, unmountComponentAtNode } from 'react-dom'
import { awaitFn, findElementByXPath, pageIsLoad, sleep } from '@/utils'
import ProblemListApp from '../problem-list/App'
import App from './App'
import './intercept'

let _root: HTMLDivElement | null = null

async function mountProblemList() {
  const xpath = '//*[@id="__next"]/*//span[text()="精选题单"]/../../..'
  const el = await findElementByXPath(xpath)

  if (!_root) {
    _root = document.createElement('div')
    el.parentNode?.insertBefore(_root, el)

    render(<ProblemListApp />, _root)
  }
}

function unmountProblemList() {
  if (_root) {
    unmountComponentAtNode(_root)
    _root.remove()
    _root = null
  }
}

let rankTitle: HTMLDivElement | null = null

async function mountRank() {
  const tableEl = await findElementByXPath('//div[@role="table"]')

  // 加载表格标题
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
    render(<App tableEl={tableEl} width={width} root={rankTitle} />, rankTitle)
    titleRow.append(rankTitle)
  }
}

function unmountRank() {
  if (rankTitle) {
    unmountComponentAtNode(rankTitle)
    rankTitle.remove()
    rankTitle = null
  }
}

async function mount() {
  mountProblemList()
  mountRank()
}

function unmount() {
  unmountProblemList()
  unmountRank()
}

const isProblemset = () => {
  const strs = location.pathname.split('/').filter(Boolean)
  return strs[0] === 'problemset'
}

void (async function main() {
  if ((window as any).next) {
    const routerEventNames = [
      'routeChangeStart',
      'routeChangeComplete',
      'beforeHistoryChange',
    ]

    // 转发 next 路由事件
    const { router } = (window as any).next
    for (const event of routerEventNames) {
      const handle = (...args: any) => {
        window.dispatchEvent(new CustomEvent(event, { detail: args }))
      }
      router.events.on(event, handle)
    }
  }
  if (isProblemset()) {
    mount()
  }
})()

window.addEventListener('urlchange', async function () {
  if (isProblemset()) {
    await sleep(500)
    await awaitFn(() => pageIsLoad('题库'))
    mount()
  } else {
    unmount()
  }
})
