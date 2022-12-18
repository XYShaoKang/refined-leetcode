import {
  forwardRef,
  useRef,
  useCallback,
  useState,
  useLayoutEffect,
  useEffect,
} from 'react'
import styled, { StyledComponentProps } from 'styled-components/macro'

import { useEvent } from '@/hooks'

import { Portal } from './Portal'

export type Placement = 'top' | 'bottom' | 'left' | 'right'

type SCProps<
  BaseProps extends object,
  AsC extends string | React.ComponentType<any>,
  FAsC extends string | React.ComponentType<any> = AsC
> = StyledComponentProps<AsC, never, BaseProps, never, FAsC> & {
  as?: AsC | undefined
  forwardedAs?: FAsC | undefined
}

type StyledComponent<
  BaseProps extends object,
  DefaultAsC extends string | React.ComponentType<any>
> = <
  AsC extends string | React.ComponentType<any> = DefaultAsC,
  FAsC extends string | React.ComponentType<any> = AsC
>(
  props: SCProps<BaseProps, AsC>,
  ref?: React.Ref<AsC>
) => React.ReactElement<SCProps<BaseProps, AsC, FAsC>> | null

interface PopperProps {
  /** 用于定位弹出窗口的元素
   *
   */
  anchorEl?: HTMLElement | null
  /** 相对于定位元素的方向
   *
   */
  placement?: Placement
  /** Popper 元素要添加到容器，如果为空，默认为 document.body
   *
   */
  container?: HTMLElement
  background?: boolean
  followScroll?: boolean
  offset?: {
    left: number
    top: number
  }
  position?: 'absolute' | 'fixed'

  /**
   * 为了确保元素定位的准确，需要监听有可能影响定位元素的祖先结点的 scroll 事件
   * 但如果 position 为 absolute 时，则不需要监听所有的祖先结点，一般只需要监听到距离最近的 position 不为 static 的祖先结点
   * 有时候会动态对某个祖先结点设置 position，这时可以将这个结点作为 rootElement 传入，则在添加事件时，只添加到这个结点为止
   * 可以起到一定的优化左右，不过如果传入不正确，可能会影响最终定位的效果
   */
  rootElement?: HTMLElement
}

const Popper: StyledComponent<PopperProps, 'span'> = forwardRef(function Popper<
  AsC extends string | React.ComponentType = 'span'
>(
  {
    anchorEl,
    placement = 'top',
    container,
    followScroll = true,
    offset,
    position,
    rootElement,
    ...props
  }: SCProps<PopperProps, AsC>,
  ref: React.ForwardedRef<AsC>
) {
  if (!position) position = 'fixed'
  const popperRef = useRef<HTMLSpanElement>()

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

  const update = useEvent(() => {
    if (anchorEl) {
      setPos(() => caclPopperPos(placement, anchorEl, position!, offset))
    }
  })

  useLayoutEffect(() => {
    update()
  }, [anchorEl, placement, update])

  useEffect(() => {
    const parents: HTMLElement[] = [],
      options: AddEventListenerOptions = { passive: true }
    if (followScroll && anchorEl) {
      if (position === 'fixed') {
        let node = anchorEl
        do {
          node.addEventListener('scroll', update, options)
          parents.push(node)
          if (!node.parentElement) break
          node = node.parentElement
        } while (node !== document.documentElement)
      } else {
        let node = anchorEl
        do {
          node.addEventListener('scroll', update, options)
          parents.push(node)
          if (
            node === rootElement ||
            getComputedStyle(node).position !== 'static'
          )
            break
          if (!node.parentElement) break
          node = node.parentElement
        } while (node !== document.documentElement)
      }
    }
    if (anchorEl) {
      window.addEventListener('resize', update, options)
    }

    return () => {
      if (anchorEl) {
        parents.forEach(el => el.removeEventListener('scroll', update, options))
        window.removeEventListener('resize', update, options)
      }
    }
  }, [anchorEl, followScroll, position, rootElement, update])

  if (!anchorEl) return null

  return (
    <Portal container={container}>
      <PopperpStyled
        {...props}
        {...pos}
        placement={placement}
        ref={mulRef}
        position={position}
      />
    </Portal>
  )
})
export default Popper

/** 计算弹出窗口相对于全局的定位信息
 *
 * @param placement 弹出窗口相对于定位元素的方向
 * @param el 定位元素
 * @returns 返回弹出窗口的定位信息
 */
function caclPopperPos(
  placement: Placement,
  el: HTMLElement,
  position: 'absolute' | 'fixed',
  offset?: { left: number; top: number }
) {
  const rect = el.getClientRects()
  let left = 0,
    top = 0
  if (!rect.length) return { left, top }
  if (position === 'fixed') [{ left, top }] = rect

  const { offsetHeight, offsetWidth } = el
  switch (placement) {
    case 'top':
      left += offsetWidth / 2
      break
    case 'bottom':
      left += offsetWidth / 2
      top += offsetHeight
      break
    case 'left':
      top += offsetHeight / 2
      break
    case 'right':
      left += offsetWidth
      top += offsetHeight / 2
      break
    default:
      // eslint-disable-next-line no-case-declarations
      const _exhaustiveCheck: never = placement
      return _exhaustiveCheck
  }
  if (offset) {
    left += offset.left ?? 0
    top += offset.top ?? 0
  }
  return { left, top }
}

export const PopperpStyled = styled.span.attrs<{
  left?: number | string
  top?: number | string
  placement: Placement
  background?: boolean
  position?: string
}>(props => {
  let transform = '',
    left = '',
    top = ''
  const offset = 0
  switch (props.placement) {
    case 'top':
      transform = `translate(-50%, calc(-100% - ${offset}px))`
      break
    case 'left':
      transform = `translate(calc(-100% - ${offset}px),-50%)`
      break
    case 'bottom':
      transform = `translate(-50%,${offset}px)`
      break
    case 'right':
      transform = `translate(${offset}px,-50%)`
      break
    default:
      break
  }

  if (typeof props.left === 'number') left = `${props.left}px`
  else if (typeof props.left === 'string') left = `${props.left}`
  else left = ''

  if (typeof props.top === 'number') top = `${props.top}px`
  else if (typeof props.top === 'string') top = `${props.top}`
  else top = ''

  return {
    style: {
      transform,
      left,
      top,
      position: props.position,
    },
  }
})``
