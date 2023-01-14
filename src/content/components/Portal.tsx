import { ReactNode } from 'react'

import { createPortal } from 'react-dom'

export const Portal = function Portal({
  children,
  container,
}: {
  children: ReactNode
  container?: HTMLElement | null
}): React.ReactPortal {
  if (!container) container = document.body
  return createPortal(children, container)
}
