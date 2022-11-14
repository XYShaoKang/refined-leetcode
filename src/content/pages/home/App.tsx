import { FC, StrictMode, useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components/macro'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import store, { persistor } from '../../app/store'
import { darkTheme, lightTheme } from '../../theme'
import GlobalStyle from './GlobalStyle'
import BlockUser from './BlockUser'
import DistortSvg from '../components/DistortSvg'

/**
 * 获取当前力扣的主题
 */
const getTheme = () => {
  const lcDarkDide = localStorage.getItem('lc-dark-side')
  if (lcDarkDide === 'dark') {
    return darkTheme
  }
  return lightTheme
}

const App: FC = () => {
  const [theme, setTheme] = useState(getTheme())
  useEffect(() => {
    // 跟随力扣的明暗主题进行切换
    const observer = new MutationObserver(mutationList => {
      if (mutationList.some(record => record.attributeName === 'class')) {
        if (document.body.classList.contains('dark')) {
          setTheme(darkTheme)
        } else {
          setTheme(lightTheme)
        }
      }
    })

    observer.observe(document.body, { attributes: true })
  }, [])

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider theme={theme}>
            <StrictMode>
              <GlobalStyle />
              <BlockUser />
              <DistortSvg />
            </StrictMode>
          </ThemeProvider>
        </DndProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
