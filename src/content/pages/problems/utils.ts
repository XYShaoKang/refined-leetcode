import { IS_MAC, findElement, isBetaUI, findElementByXPath } from '@/utils'

import { logger } from '../../../utils'

const log = logger.child({ prefix: 'Clock' })

interface RootNode {
  name: string
  node: any
}

/**
 * 使用 BFS 搜索对象下的所有属性和值
 * @param roots 需要搜索的根节点
 * @param complete 判断是否结束搜索,如果返回 true 则结束搜索
 * @returns
 */
function searchProperty(
  roots: RootNode | RootNode[],
  complete: (
    paths: string[],
    key: string,
    node: PropertyDescriptor | undefined
  ) => boolean
): void {
  if (!Array.isArray(roots)) roots = [roots]

  if (!complete) throw new Error('The lack of complete')
  const queue = roots.map(({ name, node }) => ({ path: [name], node }))
  let i = 0
  const cache = new Set()
  while (i < queue.length) {
    const { path, node } = queue[i]
    i++
    if (cache.has(node) || !node) continue
    cache.add(node)
    for (const key of Object.getOwnPropertyNames(node)) {
      const p = Object.getOwnPropertyDescriptor(node, key)

      if (complete(path, key, p)) return

      if (p?.value) queue.push({ path: path.concat(key), node: p.value })

      if (p?.get) queue.push({ path: path.concat(key, 'getter'), node: p.get })

      if (p?.set) queue.push({ path: path.concat(key, 'setter'), node: p.set })
    }
  }
}

/**
 * 获取对象中指定路径数组的值
 * @param root 指定的对象
 * @param paths 路径数组
 * @returns 获取到的值
 * @example
 * ```ts
 * getObjByPaths({a:{b:{c:{d:4}}}},['a','b','c','d']) // 4
 * ```
 */
function getObjByPaths(root: { [key: string]: unknown }, paths: string[]): any {
  let i = 0
  while (root && i < paths.length) {
    root = root[paths[i]] as { [key: string]: unknown }
    i++
  }
  return root
}

function getFiber(el: Element): FiberRoot | null {
  for (const key in el) {
    if (Reflect.hasOwnProperty.call(el, key)) {
      if (/^__reactFiber\$/.test(key)) {
        return Reflect.get(el, key)
      }
    }
  }
  return null
}

async function submissionOnMarkChange(submissionId: string): Promise<void> {
  const submissionRowEl = await findElement(`[data-row-key="${submissionId}"]`)

  const root = getFiber(submissionRowEl)

  if (!root) {
    log.error(`refined-leetcode: 未找到提交记录容器的 root`)
    return
  }

  let onMarkChange: ((onMarkChange: string) => void) | undefined

  searchProperty({ name: 'root', node: root }, (paths, key, node) => {
    if (key === 'submissionId' && node?.value === submissionId) {
      const parent = getObjByPaths(root as any, paths.slice(1))
      if (Object.prototype.hasOwnProperty.call(parent, 'onMarkChange')) {
        onMarkChange = parent.onMarkChange
        return true
      }
    }
    return false
  })

  if (onMarkChange) {
    onMarkChange(submissionId)
  } else {
    log.error(`refined-leetcode: 未找到 onMarkChange`)
  }
}

/** 检查是否按了提交快捷键
 *
 */
const checkIfSubmitKey = (e: KeyboardEvent): boolean => {
  let mate = false

  // 检查是否按下对应的快捷键,如果是 Mac 电脑为 Command 键,Window 或 Linux 为 Ctrl 键
  if (IS_MAC) {
    if (e.metaKey === true && e.ctrlKey === false) mate = true
  } else {
    if (e.ctrlKey === true && e.metaKey === false) mate = true
  }

  if (
    mate &&
    e.code === 'Enter' &&
    e.altKey === false &&
    e.shiftKey === false
  ) {
    return true
  }

  return false
}

/** 检查全局提交快捷键是否被禁用
 *
 */
const checkIfGlobalSubmitIsDisabled = (): boolean =>
  localStorage.getItem('global_disabled_submit_code') === 'false'

/** 答题页内获取需要放置计时组件的 root
 *
 * 根据是否为新版 UI 选择不同的元素
 */
async function getRoot(): Promise<HTMLElement> {
  const useBetaUI = await isBetaUI()
  if (useBetaUI) {
    const xpath = "//button[text()='提交']"
    const submit = await findElementByXPath(xpath)
    return submit.parentElement!
  } else {
    const parent = await findElement('.container__Kjnx>.action__KaAP')
    return parent
  }
}

export {
  submissionOnMarkChange,
  checkIfSubmitKey,
  checkIfGlobalSubmitIsDisabled,
  getRoot,
}
