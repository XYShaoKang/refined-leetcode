import ReactDOM, { render } from 'react-dom'

import { sleep, findAllElement, findElement } from '@/utils'

import { debounce } from '../../../utils'
import Item from './Item'
import Title from './Title'
import FileIcon from './FileIcon'

// 保存已经被加载的预测组件的 root,用于跳离排名页面时,卸载组件用
let predictorNodes: HTMLTableCellElement[] = []

// 保存已被加载的组件位置,如果已被加载,在排名页内跳转时,可以不用重复去加载
let fileIconStates: (HTMLSpanElement | null)[][] = Array.from(
  { length: 26 },
  () => []
)

// 加载预测列标题
async function loadTitle() {
  const parent = await findElement('.table-responsive>table>thead>tr')
  if (parent.children.length > 4) {
    const root = document.createElement('th')
    predictorNodes.push(root)
    parent.append(root)
    render(<Title />, root)
  } else {
    await sleep(100)
    loadTitle()
  }
}

// 加载预测列
async function loadPredictor() {
  loadTitle()

  const trs = await findAllElement('.table-responsive>table>tbody>tr')
  const hasMyRank = trs[0].className === 'success' ? true : false
  trs.forEach((tr, i) => {
    const root = document.createElement('td')
    predictorNodes.push(root)
    render(<Item row={i} hasMyRank={hasMyRank} />, root)

    tr.append(root)
  })
}

// 加载文件图标
async function loadFileIcon() {
  const trs = await findAllElement('.table-responsive>table>tbody>tr')
  const hasMyRank = trs[0].className === 'success' ? true : false
  trs.forEach((tr, i) => {
    const codetds = Array.from(tr.children).slice(4, 8)
    for (let j = 0; j < 4; j++) {
      const parent = codetds[j]?.querySelector('a')
      const iconEl = parent?.querySelector('span')

      if (parent && iconEl) {
        if (fileIconStates[i][j]) continue
        parent.removeChild(iconEl)

        render(<FileIcon row={i} col={j} hasMyRank={hasMyRank} />, parent)

        fileIconStates[i][j] = iconEl
      } else {
        const el = fileIconStates[i][j]
        if (el) ReactDOM.unmountComponentAtNode(el)
        fileIconStates[i][j] = null
      }
    }
  })
}

async function changeCompleted() {
  return new Promise<void>(function (resolve) {
    const timer = setTimeout(resolve, 1000)
    const handle = debounce(() => {
      clearTimeout(timer)
      _observer.disconnect()
      resolve()
    }, 100)
    const _observer = new MutationObserver(handle)

    _observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}

const urlMatchReg = /\/contest\/([\d\D]+)\/ranking\//

if (urlMatchReg.test(location.pathname)) {
  loadPredictor()
  loadFileIcon()
}

window.addEventListener('urlchange', async function () {
  /**
   * url 变化,可能会有四种情况:
   * 1. 从不匹配的地址跳转到匹配的地址
   * 2. 从匹配的地址跳转到不匹配的地址
   * 3. 从匹配的地址跳转到匹配的地址
   * 4. 从不匹配的地址跳转到不匹配的地址
   *
   * 其中需要做处理的是
   * 第一种情况需要加载组件
   * 第二种情况需要卸载组件
   * 而第三第四种清理可以不用处理
   */

  if (!urlMatchReg.test(location.pathname)) {
    // 从排名页跳转到比赛主页

    // 卸载已加载的 node
    predictorNodes.forEach(
      node => node && ReactDOM.unmountComponentAtNode(node)
    )
    // 清空记录的以加载 node
    predictorNodes = []
    // 重置文件图标状态
    fileIconStates.forEach(arr =>
      arr.forEach(el => {
        if (el) {
          ReactDOM.unmountComponentAtNode(el)
        }
      })
    )
    fileIconStates = Array.from({ length: 26 }, () => [])
  } else {
    // 从主页跳转到排名页
    if (predictorNodes.length === 0) {
      // 加载预测数据,以及对应的文件图标
      loadPredictor()
      loadFileIcon()
    } else {
      // 在排名页内跳转

      // 向预测组件发送自定义事件,表明已经跳转完成
      window.dispatchEvent(new Event('afterurlchange'))

      // 等待新的数据渲染完成
      await changeCompleted()
      // 新的数据渲染完成之后,在加载对应的文件图标
      loadFileIcon()
    }
  }
})
