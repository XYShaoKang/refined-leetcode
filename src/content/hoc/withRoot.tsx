import {
  StrictMode,
  ComponentType,
  useState,
  useEffect,
  forwardRef,
} from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from 'styled-components/macro'

import store, { persistor } from '@/app/store'
import { darkTheme, lightTheme } from '@/theme'
import { getPageName, getTheme, isBetaUI } from '@/utils'
import { setCurrentPage } from '@/pages/global/globalSlice'

const Loading = () => <></>

export const withRoot = <T extends ComponentType<any>>(Component: T): T => {
  const Root = forwardRef(function Root(props: any, ref: any) {
    const [theme, setTheme] = useState(getTheme())
    useEffect(() => {
      // 跟随力扣的明暗主题进行切换
      let observer: MutationObserver
      void (async function () {
        const beta = await isBetaUI()
        const el = beta ? document.documentElement : document.body

        observer = new MutationObserver(mutationList => {
          if (mutationList.some(record => record.attributeName === 'class')) {
            if (el.classList.contains('dark')) {
              setTheme(darkTheme)
            } else {
              setTheme(lightTheme)
            }
          }
        })

        observer.observe(el, { attributes: true })
      })()
      return () => {
        if (observer) observer.disconnect()
      }
    }, [])
    useEffect(() => {
      const handleUrlChange = async () => {
        const pageName = getPageName()
        store.dispatch(setCurrentPage(pageName))
      }
      window.addEventListener('urlchange', handleUrlChange)
      return () => {
        window.removeEventListener('urlchange', handleUrlChange)
      }
    }, [])

    return (
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <StrictMode>
            <ThemeProvider theme={theme}>
              <Component ref={ref} {...props} />
            </ThemeProvider>
          </StrictMode>
        </PersistGate>
      </Provider>
    )
  })

  return Root as any
}
