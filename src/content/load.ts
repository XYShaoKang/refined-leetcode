import { customEventDispatch } from './utils'

__webpack_public_path__ = chrome.runtime.getURL('.') + '/'

if (module.hot) {
  module.hot.addStatusHandler(async status => {
    if (status === 'abort') {
      return awaitReload()
    }
  })
}

function awaitReload() {
  return new Promise<void>(function (resolve) {
    console.log('sendMessage reload')
    chrome.runtime.sendMessage({ type: 'reload' }, () => {
      resolve()
    })
  })
}

function loadScript(url: string) {
  const script = document.createElement('script')

  // 将扩展 id 添加到脚本标签中,方便网页脚本通过 id 跟扩展通讯
  script.id = 'refined-leetcode'
  script.dataset.extensionid = chrome.runtime.id
  script.src = url
  document.body.append(script)
}

let isLoad = false
if (!isLoad) {
  isLoad = true
  loadScript(chrome.runtime.getURL('content.bundle.js'))
}

window.addEventListener('refinedLeetcodeGetOptions', () => {
  chrome.storage.local.get('options', ({ options }) => {
    customEventDispatch('refinedLeetcodeOptionsChange', { options })
  })
})

chrome.storage.onChanged.addListener(e => {
  if ('options' in e) {
    const options = e.options.newValue
    customEventDispatch('refinedLeetcodeOptionsChange', { options })
  }
})

window.addEventListener(
  'refinedLeetcodeSaveOptions',
  ({ detail: { options } }) => {
    chrome.storage.local.set({ options })
  }
)

export {}
