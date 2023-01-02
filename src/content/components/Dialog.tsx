import { forwardRef, ForwardedRef, ReactNode, useEffect } from 'react'
import { css } from 'styled-components/macro'

import { Portal } from './Portal'
import { StyledComponent, SCProps } from './utils'

export type Placement = 'top' | 'bottom' | 'left' | 'right'

interface DialogProps {
  open: boolean
  children: ReactNode
  onClose?: (e: any) => void
}

const Dialog: StyledComponent<DialogProps, 'span'> = forwardRef(function Popper<
  AsC extends string | React.ComponentType = 'span'
>(
  { open, children, onClose, ...props }: SCProps<DialogProps, AsC>,
  _ref: ForwardedRef<AsC>
) {
  useEffect(() => {
    const handleClose = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (onClose) {
          onClose(e)
        }
      }
    }
    if (open && children) document.body.addEventListener('keydown', handleClose)
    return () => {
      document.body.removeEventListener('keydown', handleClose)
    }
  }, [open, children, onClose])

  if (!children) return null

  return (
    <Portal {...props}>
      <div
        css={css`
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        `}
      >
        <div>{children}</div>
      </div>
    </Portal>
  )
})

export default Dialog
