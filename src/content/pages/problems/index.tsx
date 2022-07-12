import { StrictMode } from 'react'
import ReactDOM, { render } from 'react-dom'

import Clock from './Clock'
import { findElement } from '../../utils'

let root: HTMLDivElement | null = null
let titleSlug = ''

async function load() {
  titleSlug = location.pathname.split('/').filter(Boolean)[1]
  const parent = await findElement('.container__Kjnx>.action__KaAP')
  if (parent && parent instanceof HTMLElement) {
    root = document.createElement('div')
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

if (/^\/problems\//.test(location.pathname)) {
  load()
}

const urlMatchReg = /\/problems\//

function unmount() {
  if (root) {
    ReactDOM.unmountComponentAtNode(root)
    root = null
    titleSlug = ''
  }
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
    // 从答题页跳转到非答题页时,卸载计时组件
    unmount()
  } else {
    // 在答题页之间相互跳转,如果还是在同一题,则不做任何操作,如果是跳转另外一题则重新开始计时
    const curSlug = location.pathname.split('/').filter(Boolean)[1]
    if (curSlug !== titleSlug) {
      unmount()
      load()
    }
  }
})
