import React, {
  forwardRef,
  useRef,
  useCallback,
  ReactElement,
  cloneElement,
  ForwardedRef,
} from 'react'
import { useHover } from '@/hooks'
import { setRef } from '@/utils'
import { Popper, Placement, PopperProps } from './Popper'
import { StyledComponent, SCProps } from './utils'

export interface TooltipOwnerProps {
  title: ReactElement | string
  placement?: Placement
  open?: boolean
  arrow?: boolean
  icon?: ReactElement
  delay?: number
  children: React.ReactElement<any, any>
  keep?: boolean
}

export const ToolTip: StyledComponent<TooltipOwnerProps & PopperProps, 'span'> =
  forwardRef(function ToolTip1<
    AsC extends string | React.ComponentType = 'span'
  >(
    {
      title,
      placement = 'top',
      open: openProp,
      arrow: arrowProp,
      icon,
      delay,
      keep,
      children,
      ...props
    }: SCProps<TooltipOwnerProps & PopperProps, AsC>,
    ref: ForwardedRef<AsC>
  ) {
    const [setHoverRef, hover] = useHover<HTMLElement>(delay ?? 100)
    const [setPopperHoverRef, popperHover] = useHover(delay ?? 100, [
      ref as any,
    ])

    const childrenRef = useRef<HTMLElement>()

    const mulRef = useCallback(el => {
      setRef(el, childrenRef)
      setRef(el, setHoverRef)
      setRef(el, children && (children as any).ref)
    }, [])

    let open = openProp
    if (openProp === undefined) {
      open = !!title && (hover || (keep && popperHover))
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
            ref={setPopperHoverRef}
            arrow={arrow}
          >
            <>
              {icon}
              {title}
            </>
          </Popper>
        ) : null}
      </>
    )
  })
