import { ReactNode } from 'react'

import { createPortal } from 'react-dom'

export const Portal = function Portal({
  children,
  container = document.body,
}: {
  children: ReactNode
  container?: HTMLElement
}): React.ReactPortal {
  return createPortal(children, container)
}
