import React, { FC, useEffect, useRef, useState } from 'react'
import { css } from 'styled-components/macro'
import { useDrag } from 'react-dnd'

import Popper from '../components/PopperUnstyled'
import { useHover } from '../hooks'

export const ItemTypes = {
  POST: 'post',
}

export type PostItemType = {
  PostElement: HTMLElement | null
  url: string
}

/** 帖子列表拖拽手柄
 *
 * 当鼠标悬浮在帖子元素上时，动态显示手柄图标，拖过拖动图标，可以将对应的帖子作者加入黑名单
 */
const PostItem: FC<{
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ setOpen }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const postElements = useRef<HTMLElement[]>([])
  const [hoverRef, hoverIcon] = useHover()
  const [hoverContainer, setHoverContainer] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const handleMouseEnter = (e: MouseEvent) => {
    const el = e.target as HTMLDivElement

    if (el && !el.classList.contains('refined-leetcode-block')) {
      if (timer.current) clearTimeout(timer.current)
      setContainer(el)
      setHoverContainer(true)
    }
  }

  const handleMouseLeave = () => {
    timer.current = setTimeout(() => {
      setHoverContainer(false)
    }, 100)
  }

  useEffect(() => {
    postElements.current.push(
      ...document.querySelectorAll<HTMLDivElement>(
        '.css-1tc14ag-card-layer1-card-MainContentConainer > [type=QUESTION],.css-1tc14ag-card-layer1-card-MainContentConainer > [type=SOLUTION]'
      )
    )
    postElements.current.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      postElements.current.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
      postElements.current = []
    }
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(mutationList => {
      for (const mutation of mutationList) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            const type = node.getAttribute('type')
            if (type === 'QUESTION' || type === 'SOLUTION') {
              postElements.current.push(node)
              node.addEventListener('mouseenter', handleMouseEnter)
              node.addEventListener('mouseleave', handleMouseLeave)
            }
          }
        }
      }
    })
    const MainContentConainer = document.querySelector(
      '.css-1tc14ag-card-layer1-card-MainContentConainer'
    )
    if (MainContentConainer) {
      observer.observe(MainContentConainer, {
        childList: true,
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.POST,
      item: {
        PostElement: container,
        url:
          (
            container?.querySelector(
              ':scope>div:nth-of-type(1)>a'
            ) as HTMLAnchorElement
          )?.href ?? '',
      },
      collect: monitor => ({ isDragging: !!monitor.isDragging() }),
    }),
    [container]
  )

  useEffect(() => {
    if (container) {
      if (isDragging) {
        setOpen(true)
      } else {
        setOpen(false)
      }
    }
  }, [container, isDragging, setOpen])

  if (!hoverContainer && !hoverIcon && !isDragging) return null
  preview(container)

  return (
    <Popper
      anchorEl={container}
      placement="top"
      ref={(ref: HTMLSpanElement | null) => {
        hoverRef(ref)
        drag(ref)
      }}
      offset={{ top: 36, left: 339 }}
    >
      <svg
        css={css`
          height: 30px;
          fill: currentcolor;
          color: ${props => props.theme.palette.text.main};
          cursor: move;
          transform: rotateX(180deg);
        `}
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path d="M22,22H20V20H22V22M22,18H20V16H22V18M18,22H16V20H18V22M18,18H16V16H18V18M14,22H12V20H14V22M22,14H20V12H22V14Z" />
      </svg>
    </Popper>
  )
}

export default PostItem
