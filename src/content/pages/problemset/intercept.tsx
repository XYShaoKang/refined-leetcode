import store from '@/app/store'
import { awaitFn } from '@/utils'
import { fetchFavoriteDetails } from '../problem-list/favoriteSlice'

import { selectQuestonsByOption } from './questionsSlice'
import { parseParams } from './utils'

// 拦截请求相关

const originalOpen = XMLHttpRequest.prototype.open

export function intercept(): void {
  XMLHttpRequest.prototype.open = function newOpen(
    this: XMLHttpRequest,
    method: string,
    url: string,
    async?: boolean,
    user?: string,
    password?: string,
    disbaleIntercept?: boolean
  ) {
    if (
      !disbaleIntercept &&
      method.toLocaleLowerCase() === 'post' &&
      url === `/graphql/`
    ) {
      const originalSend = this.send

      this.send = async str => {
        const state = store.getState()
        const { options } = state.options,
          { currentPage } = state.global
        // 只有在启用对应功能的时候，才去拦截相关请求
        if (
          (currentPage === 'problemsetPage' &&
            options?.problemsetPage.problemRating) ||
          (currentPage === 'problemListPage' &&
            options?.problemListPage.problemRating)
        ) {
          try {
            if (typeof str === 'string') {
              const body = JSON.parse(str)
              if (
                body.query &&
                body.query.includes('query problemsetQuestionList')
              ) {
                const sortOrder = body.variables.filters?.sortOrder

                const params = parseParams()
                if (params.custom) {
                  const listId = body.variables.filters?.listId
                  // 如果参数中包含某个题单，当前有没有这个题单的数据，则需要去请求这个题单的数据
                  // 一般是在浏览第三方题单的时候
                  if (listId && !store.getState().favorites.entities[listId]) {
                    store.dispatch(fetchFavoriteDetails([listId]))
                  }
                  // 如果当前页面处于自定义参数之下，则使用在本地缓存的数据进行操作
                  for (const key of ['response', 'responseText']) {
                    Object.defineProperty(this, key, {
                      get: () => {
                        const state = store.getState()
                        if (!body.variables.filters) body.variables.filters = {}
                        body.variables.filters = {
                          ...body.variables.filters,
                          custom: params.custom,
                        }
                        const data = selectQuestonsByOption(
                          state,
                          body.variables
                        )
                        return JSON.stringify(data)
                      },
                      configurable: true,
                    })
                  }

                  for (const key of ['onreadystatechange', 'onload'] as const) {
                    const fn = this[key]
                    this[key] = async (...args) => {
                      if (key === 'onload') {
                        // 等待所需数据都加载完成
                        // TODO: 尝试设计一个更优雅的实现
                        await awaitFn(() => {
                          return true
                          const state = store.getState()
                          if (!state.questions.ids.length) return false
                          if (
                            listId &&
                            !state.favorites.entities[listId]?.questionIds
                          )
                            return false
                          if (
                            !Reflect.ownKeys(state.global.ProblemRankData)
                              .length
                          )
                            return false
                          return true
                        }, 20000)
                      }
                      fn?.apply(this, args as any)
                    }
                  }
                }

                if (
                  sortOrder &&
                  sortOrder !== 'DESCENDING' &&
                  sortOrder !== 'ASCENDING'
                ) {
                  body.variables.filters.sortOrder = 'ASCENDING'
                  str = JSON.stringify(body)
                }
              }
            }
          } catch (error) {
            //
          }
        }
        return originalSend.call(this, str)
      }
    }
    originalOpen.apply(this, [method, url, async!, user, password])
  }
}

export function restore(): void {
  XMLHttpRequest.prototype.open = originalOpen
}

intercept()

if ((window as any).next) {
  // 监听 Next.js 路由事件
  const routerEventNames = [
    'routeChangeStart',
    'routeChangeComplete',
    'beforeHistoryChange',
  ]

  // 转发 next 路由事件
  const { router } = (window as any).next
  for (const event of routerEventNames) {
    const handle = (...args: any) => {
      window.dispatchEvent(new CustomEvent(event, { detail: args }))
    }
    router.events.on(event, handle)
  }
}
