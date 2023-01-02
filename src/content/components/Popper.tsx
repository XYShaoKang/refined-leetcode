import {
  forwardRef,
  useRef,
  useCallback,
  useState,
  useLayoutEffect,
} from 'react'
import styled, { css } from 'styled-components/macro'
import { Portal } from './Portal'
import { StyledComponent, SCProps } from './utils'

export type Placement = 'top' | 'bottom' | 'left' | 'right'

export interface PopperProps {
  /**
   * 用于定位弹出窗口的元素
   */
  anchorEl?: HTMLElement | null
  /**
   * 相对于定位元素的方向
   */
  placement?: Placement
  /**
   * 是否显示小箭头
   */
  arrow?: boolean
}

export const Popper: StyledComponent<PopperProps, 'span'> = forwardRef(
  function Popper<AsC extends React.ElementType = 'span'>(
    { anchorEl, placement = 'top', arrow, ...props }: SCProps<PopperProps, AsC>,
    ref: React.ForwardedRef<AsC>
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

    const [pos, setPos] = useState<{ left: number; top: number }>({
      left: 0,
      top: 0,
    })

    useLayoutEffect(() => {
      if (anchorEl) setPos(() => caclPopperPos(placement, anchorEl))
    }, [anchorEl, placement])

    const [arrowPos, setArrow] = useState<{ left: number; top: number }>()

    useLayoutEffect(() => {
      if (arrow && popperRef.current) {
        setArrow(caclArrowPos(placement, popperRef.current, arrowSize))
      }
    }, [arrow, placement])

    if (!anchorEl) return null

    return (
      <Portal>
        <PopperpStyled
          {...props}
          {...pos}
          placement={placement}
          ref={mulRef}
          arrow={
            arrow
              ? {
                  arrowSize,
                  ...arrowPos,
                }
              : undefined
          }
        />
      </Portal>
    )
  }
)

/**
 * 计算箭头相对弹出窗口的定位信息
 * @param placement 弹出窗口相对于定位元素的方向
 * @param el 定位元素
 * @param arrowSize 箭头大小
 * @returns 返回箭头的定位信息
 */
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

/**
 * 计算弹出窗口相对于全局的定位信息
 * @param placement 弹出窗口相对于定位元素的方向
 * @param el 定位元素
 * @returns 返回弹出窗口的定位信息
 */
function caclPopperPos(placement: Placement, el: HTMLElement) {
  const [{ left, top }] = el.getClientRects()
  const { height, width } = el.getBoundingClientRect()

  switch (placement) {
    case 'top':
      return { left: left + width / 2, top }

    case 'bottom':
      return { left: left + width / 2, top: top + height }

    case 'left':
      return { left, top: top + height / 2 }

    case 'right':
      return { left: left + width, top: top + height / 2 }

    default:
      // eslint-disable-next-line no-case-declarations
      const _exhaustiveCheck: never = placement
      return _exhaustiveCheck
  }
}

export const PopperpStyled = styled.span<{
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
  transform: ${props => {
    const offset = props.arrow ? 18 : 10
    switch (props.placement) {
      case 'top':
        return `translate(-50%, calc(-100% - ${offset}px))`

      case 'left':
        return `translate(calc(-100% - ${offset}px),-50%)`

      case 'bottom':
        return `translate(-50%,${offset}px)`

      case 'right':
        return `translate(${offset}px,-50%)`

      default:
        break
    }
  }};

  color: #fff;
  /* height: 32px; */
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

  ${props => {
    if (!props.arrow) return ''
    let {
      arrow: { left, top, arrowSize } = {
        left: '',
        top: '',
        arrowSize: 0,
      },
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
      &::before {
        position: absolute;
        box-sizing: content-box;
        content: '';
        display: block;
        height: 0;
        width: 0;

        border: ${arrowSize}px solid transparent;
        border-${placement}: ${arrowSize}px solid #424242;
        ${left}
        ${top}
      }
    `
  }}
`
