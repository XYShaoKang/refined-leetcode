import { StrictMode } from 'react'
import ReactDOM, { render } from 'react-dom'

import Clock from './Clock'
import { getRoot, isBetaUI } from './utils'

let root: HTMLDivElement | null = null
let titleSlug = ''

async function load() {
  titleSlug = location.pathname.split('/').filter(Boolean)[1]
  const beta = await isBetaUI()
  const parent = await getRoot()
  if (beta) {
    // 使用新版 UI
    if (parent && parent instanceof HTMLElement) {
      // parent.style.justifyContent = 'space-between'
      root = document.createElement('div')
      parent.prepend(root)
      root.style.display = 'flex'
      root.style.alignItems = 'center'
      root.style.flexShrink = '0'

      render(
        <StrictMode>
          <Clock beta={beta} />
        </StrictMode>,
        root
      )
    }
  } else {
    if (parent && parent instanceof HTMLElement) {
      root = document.createElement('div')
      parent.prepend(root)
      root.style.display = 'flex'
      root.style.alignItems = 'center'
      root.style.flexShrink = '0'
      root.style.marginRight = '15px'

      render(
        <StrictMode>
          <Clock />
        </StrictMode>,
        root
      )
    }
  }
}

const problemUrlRegex = /^\/problems\//

void (async function main() {
  const beta = await isBetaUI()
  if (beta) {
    const params = location.pathname.split('/').filter(Boolean)
    // 新版 UI 中，如果一开始打开的就是题解页面，则当前并不存在提交栏，也就无法也不需要去挂载即使组件
    if (params[2] === 'solutions' && params[3]) return
  }
  if (problemUrlRegex.test(location.pathname)) {
    load()
  }
})()

function unmount() {
  if (root) {
    ReactDOM.unmountComponentAtNode(root)
    root = null
    titleSlug = ''
  }
}

if (problemUrlRegex.test(location.pathname)) {
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

    if (!problemUrlRegex.test(location.pathname)) {
      // 从答题页跳转到非答题页时,卸载计时组件
      unmount()
    } else {
      const beta = await isBetaUI()
      if (beta) {
        const params = location.pathname.split('/').filter(Boolean)
        // 新版 UI 中，跳转到题解页面之后，如果跳转回去，会导致提交栏发生变化，需要先卸载掉。
        if (params[2] === 'solutions' && params[3]) {
          unmount()
          return
        }
      }
      // 在答题页之间相互跳转,如果还是在同一题,则不做任何操作,如果是跳转另外一题则重新开始计时
      const curSlug = location.pathname.split('/').filter(Boolean)[1]
      if (curSlug !== titleSlug) {
        unmount()
        load()
      }
    }
  })
}
