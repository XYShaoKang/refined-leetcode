import {
  forwardRef,
  ComponentProps,
  useRef,
  useCallback,
  ReactElement,
  cloneElement,
} from 'react'

import { useHover } from '@/hooks'

import { Popper, Placement } from './Popper'

export interface TooltipProps
  extends Omit<ComponentProps<typeof Popper>, 'anchorEl' | 'placement'> {
  title: string
  placement?: Placement
  open?: boolean
  arrow?: boolean
  icon?: ReactElement
  delay?: number
  children: ReactElement
}

export const ToolTip = forwardRef(function ToolTip(
  {
    title,
    placement = 'top',
    open: openProp,
    arrow: arrowProp,
    icon,
    delay,
    children,
    ...props
  }: TooltipProps,
  ref: React.ForwardedRef<HTMLSpanElement>
) {
  const [setHoverRef, hover] = useHover<HTMLElement>(delay ?? 100)

  const childrenRef = useRef<HTMLElement>()

  const mulRef = useCallback(el => {
    childrenRef.current = el
    setHoverRef(el)
  }, [])

  let open = openProp
  if (openProp === undefined) {
    open = !!(title && hover)
  }
  let arrow = arrowProp
  if (arrowProp === undefined) {
    arrow = true
  }

  return (
    <>
      {cloneElement(children, { ...children.props, ref: mulRef })}
      {open ? (
        <Popper
          placement={placement}
          anchorEl={childrenRef.current}
          {...props}
          ref={ref}
          arrow={arrow}
        >
          {icon}
          {title}
        </Popper>
      ) : null}
    </>
  )
})
