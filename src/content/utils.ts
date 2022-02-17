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

export { download, getElement }
