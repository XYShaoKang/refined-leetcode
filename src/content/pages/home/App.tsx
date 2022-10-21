import { FC, StrictMode, useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components/macro'

import BlockUser from './BlockUser'
import { darkTheme, lightTheme } from '../../theme'

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
    <StrictMode>
      <ThemeProvider theme={theme}>
        <BlockUser />
      </ThemeProvider>
    </StrictMode>
  )
}

export default App
