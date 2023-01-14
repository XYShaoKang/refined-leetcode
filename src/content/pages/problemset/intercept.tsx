import store from '@/app/store'
import { awaitFn } from '@/utils'

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
                      const data = selectQuestonsByOption(state, body.variables)
                      return JSON.stringify(data)
                    },
                    configurable: true,
                  })
                }

                for (const key of ['onreadystatechange', 'onload'] as const) {
                  const fn = this[key]
                  this[key] = async (...args) => {
                    if (key === 'onload') {
                      await awaitFn(
                        () => !!store.getState().questions.ids.length,
                        20000
                      )
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
        return originalSend.call(this, str)
      }
    }
    originalOpen.apply(this, [method, url, async!, user, password])
  }
}

export function restore(): void {
  XMLHttpRequest.prototype.open = originalOpen
}
