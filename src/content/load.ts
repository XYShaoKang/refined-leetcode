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
  script.src = url
  document.body.append(script)
}

let isLoad = false
if (!isLoad) {
  isLoad = true
  loadScript(chrome.runtime.getURL('content.bundle.js'))
}

export {}
