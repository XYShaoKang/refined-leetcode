import { DefaultTheme } from 'styled-components/macro'

export const darkTheme: DefaultTheme = {
  mode: 'dark',
  palette: {
    primary: {
      main: `rgba(40, 40, 40, 1)`,
      dark: `rgba(26, 26, 26, 1)`,
      light: `rgba(48, 48, 48, 1)`,
      hover: `rgba(52, 52, 52, 1)`,
    },
    secondary: {
      main: `rgba(80, 80, 80, 1)`,
      light: `rgba(85, 85, 85, 1)`,
      dark: `rgba(75, 75, 75, 1)`,
      hover: `rgba(90, 90, 90, 1)`,
    },
    text: {
      main: `rgba(239, 242, 246, 0.6)`,
      light: `rgba(239, 242, 246, 1)`,
      dark: `rgba(239, 242, 246, 0.3)`,
    },
    button: {
      main: `rgba(10, 102, 204, 1)`,
      dark: `rgba(8, 89, 180, 1)`,
      light: `rgba(11, 113, 229, 1)`,
      hover: `rgba(7, 72, 146, 1)`,
      text: `rgba(255, 255, 255, 1)`,
      disable: `rgb(110 110 110)`,
    },
  },
  shadows: {
    1: `0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 4px rgba(0, 0, 0, 0.25)`,
  },
}

export const lightTheme: DefaultTheme = {
  mode: 'light',
  palette: {
    primary: {
      main: `rgba(255, 255, 255, 1)`,
      light: `rgba(255, 255, 255, 1)`,
      dark: `rgba(235, 235, 235, 1)`,
      hover: `rgba(220, 220, 220, 1)`,
    },
    secondary: {
      main: `rgba(235, 235, 235, 1)`,
      light: `rgba(245, 245, 245, 1)`,
      dark: `rgba(225, 225, 225, 1)`,
      hover: `rgba(220, 220, 220, 1)`,
    },
    text: {
      main: `hsl(0deg 0% 15%)`,
      light: `hsl(0deg 0% 15% / 75%)`,
      dark: `hsl(0deg 0% 10%)`,
    },
    button: {
      main: `rgba(0, 110, 230, 1)`,
      dark: `rgba(0, 100, 208, 1)`,
      light: `rgba(0, 122, 255, 1)`,
      hover: `rgba(0, 90, 216)`,
      text: `rgba(255, 255, 255, 1)`,
      disable: `rgb(110 110 110)`,
    },
  },
  shadows: {
    1: `0 2px 8px rgba(0, 0, 0, 0.08),0 1px 2px rgba(0, 0, 0, 0.1)`,
  },
}
