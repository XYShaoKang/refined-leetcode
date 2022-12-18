import React, { FC, useState } from 'react'
import { DropTargetMonitor, useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

import { useAppDispatch } from '@/hooks'

import PostItem, { ItemTypes, PostItemType } from './PostItem'
import DropContainer from './DropContainer'
import {
  setBlockUserByCommunityArticleId,
  setBlockUserByPostId,
  setBlockUserBySolutionSlug,
} from './blockUsersSlice'
import Mask from './Mask'

type NativeTypeHTML = {
  html: string
  dataTransfer: {
    dropEffect: string
    effectAllowed: string
    files: FileList
    items: DataTransferItemList
    types: []
  }
}

function geturl(monitor: DropTargetMonitor) {
  const itemType = monitor.getItemType(),
    item = monitor.getItem()

  if (itemType === ItemTypes.POST) {
    return (item as PostItemType).url ?? ''
  } else if (itemType === NativeTypes.HTML) {
    const div = document.createElement('div')
    div.innerHTML = (item as NativeTypeHTML).html
    const a = div.querySelector(':scope>a')
    if (!(a instanceof HTMLAnchorElement)) return ''
    return a.href
  } else {
    return ''
  }
}

export function isValid(url: string): boolean {
  try {
    const URI = new URL(url)
    if (URI.host !== 'leetcode.cn') return false
    const strs = URI.pathname.split('/').filter(Boolean)

    if (strs[0] === 'circle') {
      // 帖子
      if (strs[1] !== 'discuss' && strs[1] !== 'article') return false
      return !!strs[2]
    } else if (strs[0] === 'problems' && strs[2] === 'solution') {
      // 题解
      return !!strs[3]
    }
    return false
  } catch (error) {
    return false
  }
}

const DragAndDrop: FC = () => {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.POST, NativeTypes.HTML],
      async drop(item, monitor) {
        const url = geturl(monitor)
        if (!url) {
          console.error('无效源')
          return
        }

        if (!isValid(url)) {
          console.error('无效链接')
          return
        }

        const strs = new URL(url).pathname.split('/').filter(Boolean)
        try {
          if (strs[1] === 'discuss') {
            // 讨论帖
            const postId = strs[2]
            await dispatch(setBlockUserByPostId(postId)).unwrap()
          } else if (strs[1] === 'article') {
            // 文章
            const id = strs[2]
            await dispatch(setBlockUserByCommunityArticleId(id)).unwrap()
          } else {
            // 题解
            const solutionSlug = strs[3]
            await dispatch(setBlockUserBySolutionSlug(solutionSlug)).unwrap()
          }
        } catch (error) {
          console.error((error as { message: string }).message)
        }
      },
      collect: monitor => {
        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }
      },
    }),
    []
  )

  return (
    <>
      <PostItem setOpen={setOpen} />
      {<Mask open={open} setOpen={setOpen} />}
      {open && <DropContainer drop={drop} active={canDrop && isOver} />}
    </>
  )
}

export default DragAndDrop
