import React, {
  forwardRef,
  useRef,
  useCallback,
  ReactElement,
  cloneElement,
  ForwardedRef,
} from 'react'

import { useHover } from '@/hooks'

import { Popper, Placement, PopperProps } from './Popper'
import { StyledComponent, SCProps } from './utils'

export interface TooltipOwnerProps {
  title: string
  placement?: Placement
  open?: boolean
  arrow?: boolean
  icon?: ReactElement
  delay?: number
  children: React.ReactElement<any, any>
}

function setRef<T>(el: T, ref?: React.Ref<T>): void {
  if (ref) {
    if (typeof ref === 'function') {
      ref(el)
    } else if ('current' in ref) {
      ;(ref as React.MutableRefObject<T>).current = el
    }
  }
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
      children,
      ...props
    }: SCProps<TooltipOwnerProps & PopperProps, AsC>,
    ref: ForwardedRef<AsC>
  ) {
    const [setHoverRef, hover] = useHover<HTMLElement>(delay ?? 100)

    const childrenRef = useRef<HTMLElement>()

    const mulRef = useCallback(el => {
      setRef(el, childrenRef)
      setRef(el, setHoverRef)
      setRef(el, children && (children as any).ref)
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
