import { ComponentType, forwardRef } from 'react'

import { PageName } from 'src/options/options'
import { useAppSelector } from '@/hooks'
import { selectCurrentPage } from '@/pages/global/globalSlice'

export const withPage =
  (pageName: PageName) =>
  <T extends ComponentType<any>>(Component: T): T => {
    const App = forwardRef(function App(props: any, ref: any) {
      const currentPage = useAppSelector(selectCurrentPage)
      if (currentPage !== pageName) return null
      return <Component ref={ref} {...props} />
    })

    return App as any
  }
