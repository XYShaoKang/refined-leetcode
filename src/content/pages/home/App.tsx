import { FC } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import DistortSvg from '@/components/DistortSvg'
import { withRoot } from '@/hoc'

import GlobalStyle from './GlobalStyle'
import BlockUser from './BlockUser'

const App: FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <GlobalStyle />
      <BlockUser />
      <DistortSvg />
    </DndProvider>
  )
}

export default withRoot(App)
