import ReactDOM, { render } from 'react-dom'

import { findElement } from '@/utils'

import App from './App'

/** 存储前端组件的容器,当离开首页时,用来卸载组件
 *
 */
let _root: HTMLDivElement | null = null

/** 加载黑名单前端管理组件
 *
 */
async function load() {
  const parent = await findElement('.css-kktm6n-RightContainer')
  if (parent && parent instanceof HTMLElement) {
    if (!_root) {
      _root = document.createElement('div')
      _root.style.display = 'flex'
      _root.style.alignItems = 'center'
      _root.style.flexShrink = '0'
      _root.style.marginBottom = '10px'
      render(<App />, _root)
    }
    parent.prepend(_root)
  }
}

void (function main() {
  if (location.pathname === '/') {
    // 加载前端组件
    load()
  }
  let preUrl = location.pathname
  // 学习 <-> 首页 <-> 帖子 <-> 讨论 <-> 求职 使用前端路由
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

    if (location.pathname === '/') {
      if (preUrl !== location.pathname) {
        preUrl = location.pathname
        // 从其他页面跳转到首页
        // 加载组件
        load()
      }
    } else {
      preUrl = location.pathname
      // 跳转到其他页面

      // 卸载已加载的 node
      if (_root) ReactDOM.unmountComponentAtNode(_root)
      _root = null
    }
  })
})()

export {}
