import { findElement } from '../../utils'
import { logger } from '../../../utils'

const log = logger.child({ prefix: 'Clock' })

/**
 * 延时函数
 *
 * @param time 时间
 * @returns
 */
function sleep(time: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

function graphqlApi(
  REGION_URL: string,
  { method, body }: { method?: string; body?: unknown },
  retry = 1
): Promise<unknown> {
  method = method || 'POST'
  const RETRY_TIME = 3000,
    RETRY_COUNT = 5
  return fetch(`${REGION_URL}/graphql/`, {
    headers: {
      'content-type': 'application/json',
    },
    referrer: `${REGION_URL}/`,
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: JSON.stringify(body),
    method,
    mode: 'cors',
    credentials: 'include',
  }).then(res => {
    if (res.status === 200) {
      return res.json()
    }

    if (res.status === 429) {
      log.debug(`超出接口限制,休息一下,等待第${retry}次重试...`)
      if (retry > RETRY_COUNT) {
        throw new Error(
          `已重试 ${RETRY_COUNT} 次,仍然无法获取,可能力扣君生气了,晚点在试试吧...`
        )
      }
      // 触发限制之后,等一会儿在进行请求
      return sleep(RETRY_TIME).then(() =>
        graphqlApi(REGION_URL, { method, body }, retry + 1)
      )
    }

    throw new Error(`未知状态: ${res.status}`)
  })
}

function isObject(obj: any): obj is object {
  return typeof obj === 'object' && obj !== null
}

function baseApi(
  REGION_URL: string,
  url: string,
  method = 'GET',
  body: null | object = null,
  retry = 1
): Promise<any> {
  const RETRY_TIME = 20000,
    RETRY_COUNT = 10

  method = method.toUpperCase()
  let bodyStr: null | string

  if (method === 'GET') {
    bodyStr = null
  } else {
    bodyStr = isObject(body) ? JSON.stringify(body) : body
  }

  return fetch(REGION_URL + url, {
    headers: {
      accept: 'application/json, text/plain, */*',
    },
    referrer: `REGION_URL`,
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: bodyStr,
    method,
    mode: 'cors',
    credentials: 'include',
  }).then(res => {
    if (res.status === 200) {
      return res.json()
    }

    if (res.status === 429) {
      log.debug(`超出接口限制,休息一下,等待第${retry}次重试...`)
      if (retry > RETRY_COUNT) {
        throw new Error(
          `已重试 ${RETRY_COUNT} 次,仍然无法获取,可能力扣君生气了,晚点在试试吧...`
        )
      }
      // 触发限制之后,等一会儿在进行请求
      return sleep(RETRY_TIME).then(() =>
        baseApi(REGION_URL, url, method, body, retry + 1)
      )
    }

    throw new Error(`未知状态: ${res.status}`)
  })
}

function globalGetStatusText(e: number): string {
  switch (e) {
    case 10:
      return 'Accepted'
    case 11:
      return 'Wrong Answer'
    case 12:
      return 'Memory Limit Exceeded'
    case 13:
      return 'Output Limit Exceeded'
    case 14:
      return 'Time Limit Exceeded'
    case 15:
      return 'Runtime Error'
    case 16:
      return 'Internal Error'
    case 20:
      return 'Compile Error'
    case 21:
      return 'Unknown Error'
    case 30:
      return 'Timeout'
    default:
      return 'Invalid Error Code'
  }
}

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

const IS_MAC =
  navigator.platform.indexOf('Mac') === 0 || navigator.platform === 'iPhone'

/**
 * 检查是否按了提交快捷键
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

/**
 * 检查全局提交快捷键是否被禁用
 */
const checkIfGlobalSubmitIsDisabled = (): boolean =>
  localStorage.getItem('global_disabled_submit_code') === 'false'
const isBetaUI: () => Promise<boolean> = (() => {
  let beta: boolean | null = null
  return async function isBetaUI() {
    if (beta !== null) return beta

    const root = await Promise.race([
      findElement('#__next'),
      findElement('#app'),
    ])
    beta = root.id === '__next'
    return beta
  }
})()

async function getRoot(): Promise<HTMLElement> {
  const useBetaUI = await isBetaUI()
  if (useBetaUI) {
    let parent = await findElement('.ssg__qd-splitter-secondary-h>div>div')
    parent = [...parent.children].slice(-1)[0].children[0]
      .children[0] as HTMLElement
    parent = [...parent.children].slice(-1)[0] as HTMLElement
    return parent
  } else {
    const parent = await findElement('.container__Kjnx>.action__KaAP')
    return parent
  }
}

export {
  sleep,
  graphqlApi,
  baseApi,
  globalGetStatusText,
  submissionOnMarkChange,
  checkIfSubmitKey,
  checkIfGlobalSubmitIsDisabled,
  isBetaUI as isBetaUI,
  getRoot,
  IS_MAC,
}
