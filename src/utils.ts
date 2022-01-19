function download(str: string, filename = 'contest.md'): void {
  const blob = new Blob([str], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
}

function getElement(
  query: string,
  fn: (e: NodeListOf<Element>) => boolean = e => e.length > 0,
  timeout = 10000
): Promise<NodeListOf<Element>> {
  const delay = 100
  return new Promise(function (resolve, reject) {
    const timer = setInterval(() => {
      const element = document.querySelectorAll(query)
      if (fn(element)) {
        clearInterval(timer)
        resolve(element)
      }
      if (timeout <= 0) {
        clearInterval(timer)
        reject('超时')
      }
      timeout -= delay
    }, delay)
  })
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

function submissionOnMarkChange(submissionId: string): void {
  const root = getFiber(
    document.querySelectorAll(`[data-row-key="${submissionId}"]`)?.[0]
  )

  if (!root) {
    console.log(`leetcode-extend: 未找到提交记录容器的 root`)
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
    console.log(`leetcode-extend: 未找到 onMarkChange`)
  }
}

export { download, getElement, submissionOnMarkChange }
