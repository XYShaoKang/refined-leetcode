type HotUpdateMessage = {
  type: 'hot-update'
  url: string
}
type ReloadMessage = {
  type: 'reload'
}
type RestartMessage = {
  type: 'restart'
}

type Message = HotUpdateMessage | ReloadMessage | RestartMessage
async function hotUpdate(
  message: HotUpdateMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  const reg = /\/\.\/([\d\D]+\.hot-update\.js)/
  const url = message.url.match(reg)?.[1]

  if (url && sender.tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab!.id! },
      files: [url],
    })

    sendResponse({ data: true })
  } else {
    sendResponse({ data: false })
  }
}

async function reload(
  message: ReloadMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  console.log('start reload')
  chrome.runtime.reload()
}

async function restart(
  message: RestartMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  chrome.tabs.reload(sender.tab!.id!)
  sendResponse({ data: true })
}

if (module.hot) {
  chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
      console.log(message)
      switch (message.type) {
        case 'hot-update':
          hotUpdate(message, sender, sendResponse)
          break
        case 'reload':
          reload(message, sender, sendResponse)
          break
        case 'restart':
          restart(message, sender, sendResponse)
          break
        default:
          break
      }
      return true
    }
  )
}

export {}
