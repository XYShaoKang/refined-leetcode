import { customEventDispatch, initUrlChangeEvent } from '@/utils'
import { render } from 'react-dom'

import App from './App'

initUrlChangeEvent()

customEventDispatch('refinedLeetcodeGetOptions')

const rootId = 'Refined-LeetCode-Root'
let root = document.getElementById(rootId)
if (!root) {
  root = document.createElement('div')
  root.id = rootId
  document.body.append(root)
}
render(<App />, root)
