import { ReactNode } from 'react'

import { createPortal } from 'react-dom'

export const Portal = function Portal(props: {
  children: ReactNode
}): React.ReactPortal {
  return createPortal(props.children, document.body)
}
