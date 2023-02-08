import { FC, useEffect, useState } from 'react'
import { useAppSelector } from '@/hooks'
import { selectFavoriteIdsByCategory, FavoriteCategory } from './favoriteSlice'
import { selectFeaturedLists } from '../global/globalSlice'
import FavoriteItem from './FavoriteItem'
import FavoriteWrap from './FavoriteWrap'
import { css } from 'styled-components/macro'

const getCurrentId = () => {
  const strs = location.pathname.split('/').filter(Boolean)
  if (strs[0] === 'problem-list') return strs[1]
  return ''
}

const nameByCategory = {
  official: '官方题单',
  custom: '自定义题单',
  third: '第三方题单',
}

interface FavoriteListProps {
  category: FavoriteCategory
}

const FavoriteList: FC<FavoriteListProps> = ({ category }) => {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(open => !open)
  const ids = useAppSelector(selectFavoriteIdsByCategory(category))

  const featuredLists = useAppSelector(selectFeaturedLists)
  const name = nameByCategory[category]
  const [currentId, setCurrentId] = useState(getCurrentId())

  const isCustom = category === 'custom'

  useEffect(() => {
    if (currentId && ids.includes(currentId)) {
      if (
        featuredLists &&
        featuredLists.every(favorite => favorite.idHash !== currentId)
      ) {
        setOpen(true)
      }
    } else {
      setOpen(false)
    }
  }, [currentId])

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentId(getCurrentId())
    }
    window.addEventListener('urlchange', handleUrlChange)
    return () => {
      window.removeEventListener('urlchange', handleUrlChange)
    }
  }, [])

  return (
    <FavoriteWrap
      expanded={open}
      onChange={toggle}
      title={name}
      showHelp={open && isCustom}
      showAdd={isCustom && open}
    >
      <ul
        css={css`
          max-height: 400px;
          overflow: auto;
          user-select: text;
        `}
      >
        {ids.map(idHash => (
          <FavoriteItem
            key={idHash}
            idHash={idHash}
            current={currentId === idHash}
            showEditIcon={isCustom}
          />
        ))}
      </ul>
    </FavoriteWrap>
  )
}

export default FavoriteList
