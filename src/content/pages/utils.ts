// 添加监听 url 变化的事件
const initUrlChangeEvent = (() => {
  let isLoad = false
  const load = () => {
    if (isLoad) return
    isLoad = true

    const oldPushState = history.pushState
    const oldReplaceState = history.replaceState

    history.pushState = function pushState(...args) {
      oldPushState.apply(window, args)
      window.dispatchEvent(new Event('urlchange'))
    }

    history.replaceState = function replaceState(...args) {
      oldReplaceState.apply(window, args)
      window.dispatchEvent(new Event('urlchange'))
    }

    window.addEventListener('popstate', () => {
      window.dispatchEvent(new Event('urlchange'))
    })
  }
  return load
})()

export { initUrlChangeEvent }
