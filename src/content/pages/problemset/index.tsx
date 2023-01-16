import { render, unmountComponentAtNode } from 'react-dom'
import {
  autoMount,
  awaitFn,
  findElementByXPath,
  pageIsLoad,
  sleep,
} from '@/utils'
import ProblemListApp from '../problem-list/App'
import App from './App'
import './intercept'

let _root: HTMLDivElement | null = null
const problemListXPath = '//*[@id="__next"]/*//span[text()="精选题单"]/../../..'
const [mountProblemList, unmountProblemList] = autoMount(
  problemListXPath,
  async () => {
    const el = await findElementByXPath(problemListXPath)
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
    render(<ProblemListApp />, _root)
  },
  els => els[0].parentElement
)

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
