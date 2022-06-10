import {
  ReactNode,
  forwardRef,
  ComponentProps,
  useRef,
  useCallback,
  ReactElement,
  useState,
  useEffect,
  cloneElement,
  useLayoutEffect,
} from 'react'
import { createPortal } from 'react-dom'
import styled, { css } from 'styled-components/macro'
import { useHover } from '../hooks'

const PopperpStyled = styled.span<{
  left?: number | string
  top?: number | string
  placement: Placement
  arrow?: {
    arrowSize?: number
    left?: number | string
    top?: number | string
  }
}>`
  position: absolute;
  transform: translate(-50%, -150%);

  color: #fff;
  height: 32px;
  padding: 6px 8px;
  background: rgb(66, 66, 66);
  border-radius: 3px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.54);

  ${props => {
    let { left, top } = props

    if (typeof left === 'number') left = `left: ${left}px;`
    else if (typeof left === 'string') left = `left: ${left};`
    else left = ''

    if (typeof top === 'number') top = `top: ${top}px;`
    else if (typeof top === 'string') top = `top: ${top};`
    else top = ''

    return css`
      ${left}
      ${top}
    `
  }}

  &::before {
    position: absolute;
    box-sizing: content-box;
    content: '';
    display: block;
    height: 0;
    width: 0;

    ${props => {
      let {
        arrow: { left, top, arrowSize } = { left: '', top: '', arrowSize: 0 },
        placement,
      } = props ?? {}

      if (left) {
        if (typeof left === 'number') left = `left: ${left}px;`
        else if (typeof left === 'string') left = `left: ${left};`
      } else left = ''

      if (top) {
        if (typeof top === 'number') top = `top: ${top}px;`
        else if (typeof top === 'string') top = `top: ${top};`
      } else top = ''

      return css`
        border: ${arrowSize}px solid transparent;
        border-${placement}: ${arrowSize}px solid #424242;
        ${left}
        ${top}
      `
    }}
  }
`

const Portal = function Portal(props: { children: ReactNode }) {
  return createPortal(props.children, document.body)
}

const Popper = forwardRef(function Popper(
  {
    placement,
    ...props
  }: { placement: Placement } & ComponentProps<typeof PopperpStyled>,
  ref
) {
  const popperRef = useRef<HTMLSpanElement>()
  const arrowSize = 8
  const mulRef = useCallback(el => {
    popperRef.current = el
    if (ref) {
      if (typeof ref === 'function') {
        ref(el)
      } else {
        ref.current = el
      }
    }
  }, [])

  const [arrow, setArrow] = useState<{ left: number; top: number }>()
  useLayoutEffect(() => {
    if (popperRef.current) {
      setArrow(caclArrowPos(placement, popperRef.current, arrowSize))
    }
  }, [placement])
  return (
    <Portal>
      <PopperpStyled
        {...props}
        placement={placement}
        ref={mulRef}
        arrow={{
          arrowSize,
          ...arrow,
        }}
      />
    </Portal>
  )
})

type Placement = 'top' | 'bottom' | 'left' | 'right'
function caclArrowPos(
  placement: Placement,
  el: HTMLElement,
  arrowSize: number
) {
  const { offsetHeight, offsetWidth } = el
  switch (placement) {
    case 'top':
      return { left: offsetWidth / 2 - arrowSize, top: offsetHeight }

    case 'bottom':
      return { left: offsetWidth / 2 - arrowSize, top: -arrowSize * 2 }

    case 'left':
      return { left: offsetWidth, top: offsetHeight / 2 - arrowSize }

    case 'right':
      return { left: -arrowSize * 2, top: offsetHeight / 2 - arrowSize }

    default:
      // eslint-disable-next-line no-case-declarations
      const _exhaustiveCheck: never = placement
      return _exhaustiveCheck
  }
}

function caclPopperPos(placement: Placement, el: HTMLElement) {
  const [{ left, top }] = el.getClientRects()
  const { offsetHeight, offsetWidth } = el
  switch (placement) {
    case 'top':
      return { left: left + offsetWidth / 2, top }

    case 'bottom':
      return { left: left + offsetWidth / 2, top: top + offsetHeight }

    case 'left':
      return { left, top: top + offsetHeight / 2 }

    case 'right':
      return { left: left + offsetWidth, top: top + offsetHeight / 2 }

    default:
      // eslint-disable-next-line no-case-declarations
      const _exhaustiveCheck: never = placement
      return _exhaustiveCheck
  }
}

export const ToolTip = forwardRef(function Button(
  {
    title,
    placement = 'top',
    children,
    ...props
  }: {
    title: string
    placement: Placement
    children: ReactElement
  } & ComponentProps<typeof PopperpStyled>,
  ref
) {
  const [setHoverRef, hover] = useHover<HTMLElement>(100)

  const childrenRef = useRef<HTMLElement>()
  const [pos, setPos] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  })

  const mulRef = useCallback(el => {
    childrenRef.current = el
    setHoverRef(el)
  }, [])

  useEffect(() => {
    const el = childrenRef.current
    if (el) {
      setPos(() => caclPopperPos(placement, el))
    }
  }, [hover, placement])

  return (
    <>
      {cloneElement(children, { ...children.props, ref: mulRef })}
      {title && hover && (
        <Popper placement={placement} {...props} {...pos} ref={ref}>
          {title}
        </Popper>
      )}
    </>
  )
})
