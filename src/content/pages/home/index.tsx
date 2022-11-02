import ReactDOM, { render } from 'react-dom'

import { debounce, findElement, throttle } from '../../utils'
import App from './App'
import { initUrlChangeEvent } from '../utils'

initUrlChangeEvent()

/**
 * 存储前端组件的容器,当离开首页时,用来卸载组件
 */
let _root: HTMLDivElement | null = null
/**
 * 加载组件
 */
async function load() {
  const parent = await findElement('.css-kktm6n-RightContainer')
  if (parent && parent instanceof HTMLElement) {
    _root = document.createElement('div')
    parent.prepend(_root)
    _root.style.display = 'flex'
    _root.style.alignItems = 'center'
    _root.style.flexShrink = '0'
    _root.style.marginBottom = '10px'

    render(<App />, _root)
  }
}

type NotyItem = {
  data: {
    myFeed: {
      nextToken: string
      rows: {
        feedContent: { author: { userSlug: string } }
        meta: { link: string }
      }[]
    }
  }
}
/**
 * 获取帖子列表
 * @param nextToken 下一组帖子的 token,如果为空,则获取最新的一组帖子
 */
function getNoty(nextToken?: string): Promise<NotyItem> {
  return fetch('https://leetcode.cn/graphql/noty', {
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN',
      'content-type': 'application/json',
    },
    referrer: 'https://leetcode.cn/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: JSON.stringify({
      operationName: 'myFeed',
      variables: { version: 1, nextToken, limit: 30 },
      query: /* GraphQL */ `
        query myFeed($nextToken: String, $limit: Int!, $version: Int) {
          myFeed(nextToken: $nextToken, limit: $limit, version: $version) {
            nextToken
            rows {
              tags {
                name
                slug
                tagType
                __typename
              }
              feedContent {
                ... on Article {
                  summary
                  uuid
                  slug
                  title
                  articleType
                  createdAt
                  updatedAt
                  thumbnail
                  author {
                    userSlug
                  }
                  __typename
                }
                ... on LeetBook {
                  summary
                  slug
                  image
                  modifiedAt
                  title
                  __typename
                }
                ... on BookPage {
                  leetbook {
                    slug
                    image
                    summary
                    __typename
                  }
                  title
                  summary
                  __typename
                }
                __typename
              }
              actor {
                userSlug
                avatar
                realName
                __typename
              }
              verb
              subscribed
              timestamp
              recommended
              questionInfo {
                title
                Slug
                __typename
              }
              meta {
                link
                __typename
              }
              __typename
            }
            __typename
          }
        }
      `,
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  }).then(res => res.json())
}

type UserInfo = {
  slug: string
  name: string
}

/**
 * 存储下一组帖子的 token
 */
let _nextToken = ''
/**
 * 存储由黑名单用户发布的帖子链接
 */
const blocklistLinkSet = new Set<string>()

/**
 * 获取黑名单列表
 * 获取所有帖子列表,筛选出其中由黑名单用户发布的帖子
 */
async function getBlocklist() {
  const key = 'BlockUserList'
  const data = localStorage.getItem(key)
  if (data) {
    try {
      // 获取黑名单用户
      const blockUserList: UserInfo[] = JSON.parse(data)

      // 获取首页帖子列表
      const {
        data: {
          myFeed: { nextToken, rows },
        },
      } = await getNoty(_nextToken)
      _nextToken = nextToken

      // 选出由黑名单用户发布的帖子
      const userSet = new Set(blockUserList.map(item => item.slug))
      for (const item of rows.filter(item =>
        userSet.has(item?.feedContent?.author?.userSlug)
      )) {
        blocklistLinkSet.add(item.meta.link)
      }
    } catch (error) {
      //
    }
  }
}

/**
 * 执行隐藏黑名单用户发布的帖子
 */
async function block() {
  // 找到帖子对应的元素,通过 CSS 隐藏
  const root = await findElement(
    '.css-1tc14ag-card-layer1-card-MainContentConainer'
  )
  const blockEls: HTMLElement[] = []
  const els = [...root.children]
  for (const [i, el] of els.entries()) {
    if (el.getAttribute('type') === 'QUESTION') {
      const a = [
        ...(el.querySelector('.css-r8hj4d-Content')?.children ?? []),
      ].find(el => el.tagName === 'A') as HTMLAnchorElement

      if (a && blocklistLinkSet.has(new URL(a.href).pathname)) {
        // 帖子元素
        blockEls.push(el as HTMLElement)
        // 分隔元素
        // 如果是列表中的最后一项帖子，则没有分隔元素
        if (els[i + 1]) blockEls.push(els[i + 1] as HTMLElement)
      }
    }
  }

  for (const el of blockEls) {
    if (el && el.style) el.style.display = 'none'
  }
}

/**
 * 保存监听元素更改的 observer,用于离开首页时,停止监听
 */
let _observer: MutationObserver | null = null
/**
 * 监听`加载更多`的事件,对后续新增黑名单帖子执行隐藏
 */
async function listeningLoadMore() {
  // 当点击加载更多按钮时,同样需要过滤掉新添加的符合黑名单规则的帖子
  // 在加载的过程中,先去获取当前加载帖子列表
  // 然后等待加载完毕之后,在去添加隐藏符合黑名单规则的帖子
  let start = true,
    cnt = 0
  // 在每次加载新的帖子开始时去获取处于黑名单中的帖子
  const throttleGetBlocklist = throttle(() => {
    start = false
    getBlocklist()
  }, 100)
  // 在加载完成之后,通过 CSS 将黑名单中的帖子隐藏
  const debounceBlock = debounce(() => {
    block()
    cnt = 0
    start = true
  }, 100)

  const contentRoot = await findElement(
    '#lc-content > div > div > .css-185cq5e-LeftContainer > .css-1tc14ag-card-layer1-card-MainContentConainer'
  )

  _observer = new MutationObserver(mutationList => {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        cnt++
        if (start) throttleGetBlocklist()
        if (cnt > 2) debounceBlock()
      }
    }
  })

  _observer.observe(contentRoot, { childList: true })
}
/**
 * 从首页的帖子列表中,隐藏黑名单用户发布的帖子
 *
 * 1. 通过 API 获取当前首页的帖子列表
 * 2. 从其中筛选出由黑名单用户发布的帖子
 * 3. 通过 CSS 将对应的帖子隐藏
 */
async function hideBlacklist() {
  _nextToken = ''
  blocklistLinkSet.clear()
  await getBlocklist()
  await block()
  listeningLoadMore()
}

void (function main() {
  if (location.pathname === '/') {
    // 首次加载时屏蔽
    hideBlacklist()
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
        // 首次加载时，执行屏蔽
        hideBlacklist()
        // 加载组件
        load()
      }
    } else {
      preUrl = location.pathname
      // 跳转到其他页面

      // 卸载已加载的 node
      if (_root) ReactDOM.unmountComponentAtNode(_root)
      _root = null
      // 卸载监听事件
      if (_observer) _observer.disconnect()
      _observer = null
    }
  })
})()

export {}
