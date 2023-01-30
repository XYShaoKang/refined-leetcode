import './hot'
import './lcrp'

import { defaultOptions } from '../options/options'

chrome.runtime.onInstalled.addListener(e => {
  if (e.reason === 'install') {
    // 当前是首次安装，使用默认配置
    chrome.storage.local.set({ options: defaultOptions })
  } else {
    chrome.storage.local.get('options').then(({ options }) => {
      // 当前是更新
      if (!options) {
        // 不存在配置选项，因为不确定用户之前主要使用哪些功能，所以启用所有功能，让用户决定是否关闭某些功能
        options = {}
        for (const page of Reflect.ownKeys(defaultOptions)) {
          options[page] = {}
          for (const key of Reflect.ownKeys((defaultOptions as any)[page])) {
            options[page][key] = true
          }
        }
      } else {
        // 如果存在配置，则将将当前配置与默认配置进行合并，以当前配置为主，如果发现不存在某个配置，则将其设置为默认配置
        for (const page of Reflect.ownKeys(defaultOptions)) {
          if (!options[page]) options[page] = {}
          for (const key of Reflect.ownKeys((defaultOptions as any)[page])) {
            if (options[page][key] === undefined)
              options[page][key] = (defaultOptions as any)[page][key]
          }
        }
      }
      chrome.storage.local.set({ options })
      console.log(options)
    })
  }
  console.log(e, new Date())
})

export {}
