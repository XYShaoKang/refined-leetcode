import { useState, useEffect } from 'react'
import { Portal } from '@/components/Portal'
import { findAllElement, findElement } from '@/utils'
import Title from './Title'
import Item from './Item'

const Prediction: React.FC = () => {
  const [titleRoot, setTitleRoot] = useState<HTMLElement>()
  const [rows, setRows] = useState<HTMLElement[]>()
  useEffect(() => {
    let mount = true
    void (async function () {
      const parent = await findElement('.table-responsive>table>thead>tr')
      const trs = await findAllElement('.table-responsive>table>tbody>tr')
      if (mount) {
        setTitleRoot(parent)
        setRows([...trs])
      }
    })()
    return () => {
      mount = false
    }
  }, [])

  const hasMyRank = rows?.[0]?.className === 'success' ? true : false
  return (
    <>
      {titleRoot && (
        <Portal container={titleRoot}>
          <th>
            <Title />
          </th>
        </Portal>
      )}
      {rows?.map((row, i) => (
        <Portal container={row} key={i}>
          <td>
            <Item row={i} hasMyRank={hasMyRank} />
          </td>
        </Portal>
      ))}
    </>
  )
}

export default Prediction
