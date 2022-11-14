// import original module declarations
import 'styled-components/macro'
import type {} from 'styled-components/cssprop'

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    mode: string
    palette: {
      primary: {
        main: string
        light: string
        dark: string
        hover: string
      }
      secondary: {
        main: string
        light: string
        dark: string
        hover: string
      }
      text: {
        main: string
        light: string
        dark: string
      }
      button: {
        main: string
        light: string
        dark: string
        hover: string
        text: string
        disable: string
      }
    }
    shadows: {
      [key: number]: string
    }
  }
}
