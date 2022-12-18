import { FC } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import GlobalStyle from './GlobalStyle'
import BlockUser from './BlockUser'
import DistortSvg from '../components/DistortSvg'
import { withRoot } from '../../hoc'

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
