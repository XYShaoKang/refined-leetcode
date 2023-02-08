import { useEffectMount } from '@/hooks'
import { findElementByXPath } from '@/utils'
import { debounce } from 'src/utils'

export const useSetProblemListRoot = (
  problemListXPath: string,
  isLoad: boolean,
  setProblemListRoot: (root: HTMLElement) => void
): void => {
  useEffectMount(
    async state => {
      if (!isLoad) return
      const handleMount = async () => {
        const el = await findElementByXPath(problemListXPath)

        if (state.isMount && el.parentNode) {
          const root = document.createElement('div')
          el.parentNode.insertBefore(root, el)
          setProblemListRoot(root)
          state.unmount.push(() => root.remove())
          const handleChange = debounce(async () => {
            const el = await findElementByXPath(problemListXPath)

            if (el.previousSibling === root) return
            if (!state.isMount) return
            observer.disconnect()
            root.remove()
            state.unmount = []
            handleMount()
          }, 100)
          const observer = new MutationObserver(handleChange)
          observer.observe(el.parentNode, { childList: true })
        }
      }
      handleMount()
    },
    [isLoad]
  )
}
