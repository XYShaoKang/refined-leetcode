import { StrictMode } from 'react'
import ReactDom, { render } from 'react-dom'
import { Provider } from 'react-redux'

import { getElement } from '../../utils'
import Item from './Item'
import Title from './Title'

import store from '../../app/store'
import { initUrlChangeEvent } from '../utils'

let nodes: HTMLTableCellElement[] = []

async function loadTitle() {
  const parent = await getElement('.table-responsive>table>thead>tr')

  if (parent.length > 0) {
    const root = document.createElement('th')
    nodes.push(root)
    parent[0].append(root)
    render(
      <StrictMode>
        <Title />
      </StrictMode>,
      root
    )
  }
}

async function loadPredictor() {
  loadTitle()

  const trs = await getElement('.table-responsive>table>tbody>tr')
  const start = trs[0].className === 'success' ? 1 : 0
  trs.forEach((tr, i) => {
    const root = document.createElement('td')
    nodes.push(root)
    render(
      <StrictMode>
        <Provider store={store}>
          <Item index={i - start} />
        </Provider>
      </StrictMode>,
      root
    )

    tr.append(root)
  })
}

const urlMatchReg = /https:\/\/leetcode-cn\.com\/contest\/([\d\D]+)\/ranking\//
window.onload = () => {
  if (urlMatchReg.test(location.href)) {
    loadPredictor()
  }
}

initUrlChangeEvent()

window.addEventListener('urlchange', function () {
  /**
   * url 变化,可能会有四种情况:
   * 1. 从不匹配的地址跳转到匹配的地址
   * 2. 从匹配的地址跳转到不匹配的地址
   * 3. 从匹配的地址跳转到不匹配的地址
   * 4. 从不匹配的地址跳转到不匹配的地址
   *
   * 其中需要做处理的是
   * 第一种情况需要加载组件
   * 第二种情况需要卸载组件
   * 而第三第四种清理可以不用处理
   */

  if (!urlMatchReg.test(location.href)) {
    // 从排名页跳转到比赛主页
    nodes.forEach(node => ReactDom.unmountComponentAtNode(node))
    nodes = []
  } else {
    // 从主页跳转到排名页
    if (nodes.length === 0) {
      loadPredictor()
    } else {
      window.dispatchEvent(new Event('afterurlchange'))
    }
  }
})
