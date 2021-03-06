// 添加监听 url 变化的事件
const initUrlChangeEvent = (() => {
  let isLoad = false
  const load = () => {
    if (isLoad) return
    isLoad = true

    const oldPushState = history.pushState
    const oldReplaceState = history.replaceState

    history.pushState = function pushState(...args) {
      const res = oldPushState.apply(this, args)
      window.dispatchEvent(new Event('urlchange'))
      return res
    }

    history.replaceState = function replaceState(...args) {
      const res = oldReplaceState.apply(this, args)
      window.dispatchEvent(new Event('urlchange'))
      return res
    }

    window.addEventListener('popstate', () => {
      window.dispatchEvent(new Event('urlchange'))
    })
  }
  return load
})()

export { initUrlChangeEvent }
