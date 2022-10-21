// import original module declarations
import 'styled-components/macro'

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
      }
    }
    shadows: {
      [key: number]: string
    }
  }
}
