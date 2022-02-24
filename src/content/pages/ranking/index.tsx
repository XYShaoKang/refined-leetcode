import { StrictMode } from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import { getElement } from '../../utils'
import Item from './Item'
import Title from './Title'

import store from '../../app/store'

const reg = /https:\/\/leetcode-cn\.com\/contest\/([\d\D]+)\/ranking\//

async function loadTitle() {
  const parent = await getElement('.table-responsive>table>thead>tr')

  if (parent.length > 0) {
    const root = document.createElement('th')
    parent[0].append(root)
    render(
      <StrictMode>
        <Title />
      </StrictMode>,
      root
    )
  }
}

if (reg.test(location.href)) {
  window.onload = async () => {
    loadTitle()

    const trs = await getElement('.table-responsive>table>tbody>tr')

    const start = trs[0].className === 'success' ? 1 : 0
    trs.forEach((tr, i) => {
      const root = document.createElement('td')

      render(
        <StrictMode>
          <Provider store={store}>
            <Item index={i - start} />
          </Provider>
        </StrictMode>,
        root
      )

      tr.append(root)
    })
  }
}
