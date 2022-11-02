import { StrictMode } from 'react'
import ReactDOM, { render } from 'react-dom'

import Clock from './Clock'
import Random from './Random'
import { getRoot, isBetaUI } from './utils'
import { IS_MAC, findElement } from '../../utils'

let root: HTMLDivElement | null = null,
  randomRoot: HTMLDivElement | null = null,
  titleSlug = ''

/** 阻止按 CMD(Win 中为 Ctrl) + s 键时，弹出浏览器自带的保存页面
 */
const handlePreventSave = (e: KeyboardEvent) => {
  if (e.altKey || e.shiftKey) return
  if (IS_MAC) {
    if (!e.ctrlKey && e.metaKey && e.code === 'KeyS') {
      e.preventDefault()
    }
  } else {
    if (!e.metaKey && e.ctrlKey && e.code === 'KeyS') {
      e.preventDefault()
    }
  }
}
async function load() {
  titleSlug = location.pathname.split('/').filter(Boolean)[1]
  const beta = await isBetaUI()
  const parent = await getRoot()
  if (beta) {
    // 使用新版 UI
    if (parent && parent instanceof HTMLElement) {
      if (!root) {
        root = document.createElement('div')
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

      parent.prepend(root)
    }

    const monacoEditor = await findElement('.monaco-editor')
    if (monacoEditor) {
      monacoEditor.addEventListener('keydown', handlePreventSave)
    }
  } else {
    if (parent && parent instanceof HTMLElement) {
      if (!root) {
        root = document.createElement('div')
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

      parent.prepend(root)
    }
  }
}

/** 加载`随机一题`按钮
 *
 * 旧版答题页已经有`随机一题`的按钮，所以只需要在新版答题页中添加即可，
 * 新版答题页中的`上一题`和`下一题`按钮是放在上方导航栏处，
 * 所以`随机一题`按钮也跟它们一起放在导航栏处。
 *
 * 因为导航栏在进行题目切换的时候，并不会变化，
 * 所以不用像计时组件那样，每次在切换题目的时候都需要卸载后重新加载，
 * 只需要考虑跟其他非答题页之间进行切换的逻辑即可。
 */
async function loadRandom() {
  const beta = await isBetaUI()
  if (beta) {
    const nav = await findElement(
      '#__next > div > div > div > nav > div > div > div:nth-child(2)'
    )
    if (!randomRoot) {
      randomRoot = document.createElement('div')
      randomRoot.style.lineHeight = '0'

      render(
        <StrictMode>
          <Random />
        </StrictMode>,
        randomRoot
      )
    }
    nav.append(randomRoot)
  }
}

/** 判断是否为常规答题页
 *
 */
const isProblemPage = () => {
  const strs = location.pathname.split('/').filter(Boolean)
  return strs[0] === 'problems'
}

/** 判断是否比赛答题页
 *
 */
const isContestProblemPage = () => {
  const strs = location.pathname.split('/').filter(Boolean)
  return strs[0] === 'contest' && strs[2] === 'problems'
}

void (async function main() {
  if (isProblemPage()) {
    const beta = await isBetaUI()
    if (beta) {
      loadRandom()
      const params = location.pathname.split('/').filter(Boolean)
      // 新版 UI 中，如果一开始打开的就是题解页面，则当前并不存在提交栏，也就无法也不需要去挂载即使组件
      if (params[2] === 'solutions' && params[3]) return
    }
    load()
  }
  if (isContestProblemPage()) {
    const monacoEditor = await findElement('.CodeMirror')
    if (monacoEditor) {
      monacoEditor.addEventListener('keydown', handlePreventSave)
    }
  }
})()

function unmount(el: HTMLElement | null) {
  if (el) {
    ReactDOM.unmountComponentAtNode(el)
    el.remove()
    el = null
    titleSlug = ''
  }
}

if (isProblemPage() || location.pathname === '/problemset/all/') {
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

    if (!isProblemPage()) {
      // 从答题页跳转到非答题页时,卸载计时组件
      unmount(root)
      unmount(randomRoot)
    } else {
      const beta = await isBetaUI()
      if (beta) {
        loadRandom()
        const params = location.pathname.split('/').filter(Boolean)
        // 新版 UI 中，跳转到题解页面之后，如果跳转回去，会导致提交栏发生变化，需要先卸载掉。
        if (params[2] === 'solutions' && params[3]) {
          unmount(root)
          return
        }
      }
      // 在答题页之间相互跳转,如果还是在同一题,则不做任何操作,如果是跳转另外一题则重新开始计时
      const curSlug = location.pathname.split('/').filter(Boolean)[1]
      if (curSlug !== titleSlug) {
        unmount(root)
        load()
      }
    }
  })
}
