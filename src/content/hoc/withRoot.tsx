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
import { getTheme, isBetaUI } from '@/utils'

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
