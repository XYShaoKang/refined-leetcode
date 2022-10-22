import {
  forwardRef,
  ComponentProps,
  useRef,
  useCallback,
  ReactElement,
  cloneElement,
} from 'react'

import { useHover } from '../hooks'
import { Popper, Placement } from './Popper'

export interface TooltipProps
  extends Omit<ComponentProps<typeof Popper>, 'anchorEl' | 'placement'> {
  title: string
  placement?: Placement
  children: ReactElement
}

export const ToolTip = forwardRef(function ToolTip(
  { title, placement = 'top', children, ...props }: TooltipProps,
  ref: React.ForwardedRef<HTMLSpanElement>
) {
  const [setHoverRef, hover] = useHover<HTMLElement>(100)

  const childrenRef = useRef<HTMLElement>()

  const mulRef = useCallback(el => {
    childrenRef.current = el
    setHoverRef(el)
  }, [])

  return (
    <>
      {cloneElement(children, { ...children.props, ref: mulRef })}
      {title && hover && (
        <Popper
          placement={placement}
          anchorEl={childrenRef.current}
          {...props}
          ref={ref}
          arrow={true}
        >
          {title}
        </Popper>
      )}
    </>
  )
})
