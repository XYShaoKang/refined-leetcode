import { FC } from 'react'
import { withRoot } from './hoc'

import Ranking from './pages/ranking/App'
import Home from './pages/home/App'
import Timer from './pages/problems/App'
import ShortcutKeyOption from './pages/problems/ShortcutKeyOption'
import Problemset from './pages/problemset/App'
import ProblemList from './pages/problem-list/App'
import { customEventDispatch } from './utils'
import OptimizedContestProblemsPage from '@/pages/problems/OptimizedContestProblemsPage'

const App: FC = () => {
  customEventDispatch('refinedLeetcodeGetOptions')
  return (
    <>
      <Ranking />
      <Home />
      <Timer />
      <ShortcutKeyOption />
      <Problemset />
      <ProblemList />
      <OptimizedContestProblemsPage />
    </>
  )
}

export default withRoot(App)
