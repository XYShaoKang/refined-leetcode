import { FC, useEffect, useState } from 'react'
import { css } from 'styled-components/macro'

import { useAppSelector, useAppDispatch, useHover } from '@/hooks'

import {
  selectFavoriteIdsByCategory,
  FavoriteCategory,
  saveFavorite,
  addFavorite,
  fetchFavoriteDetails,
} from './favoriteSlice'
import { selectFeaturedLists } from '../global/globalSlice'
import FavoriteItem from './FavoriteItem'
import Editor from './Editor'

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

const FavoriteList: FC<{ category: FavoriteCategory }> = ({ category }) => {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(open => !open)
  const ids = useAppSelector(selectFavoriteIdsByCategory(category))
  const dispatch = useAppDispatch()

  const featuredLists = useAppSelector(selectFeaturedLists)
  const name = nameByCategory[category]
  const [currentId, setCurrentId] = useState(getCurrentId())
  const [enableEdit, setEnableEdit] = useState(false)
  const [hoverHelpRef, hoverHelp] = useHover()
  const toggleEnableEdit = () => {
    setEnableEdit(enableEdit => !enableEdit)
  }

  const handleAddFavorite = async (text: string) => {
    const res = await dispatch(saveFavorite(text)).unwrap()
    if (res.ok) {
      await dispatch(addFavorite(res.favoriteIdHash))
      await dispatch(fetchFavoriteDetails([res.favoriteIdHash]))
    }
    toggleEnableEdit()
  }

  const isCustom = category === 'custom'

  useEffect(() => {
    if (
      currentId &&
      ids.includes(currentId) &&
      featuredLists &&
      featuredLists.every(favorite => favorite.idHash !== currentId)
    ) {
      setOpen(true)
    }
  }, [currentId, featuredLists, ids])

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
    <div
      css={css`
        box-shadow: ${props => props.theme.shadows[2]};
        background-color: ${props => props.theme.palette.primary.main};
        border-radius: 8px;
        padding: ${open ? '8px 0' : ''};
        margin-top: 16px;
      `}
    >
      <div>
        <div
          css={css`
            padding: 0 16px;
            color: ${props => props.theme.palette.text.main};
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
          `}
          onClick={toggle}
        >
          <span>{name}</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {open && isCustom && (
              <div ref={hoverHelpRef} onClick={e => e.stopPropagation()}>
                <svg
                  viewBox="0 0 24 24"
                  style={{
                    height: 20,
                    fill: 'currentColor',
                  }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                </svg>
              </div>
            )}
            <svg
              viewBox="0 0 24 24"
              style={{
                height: 20,
                width: 20,
                fill: 'currentColor',
                transform: !open ? 'rotate3d(0, 0, 1, 90deg)' : '',
              }}
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
        </div>
      </div>

      {open && (
        <ul
          css={css`
            max-height: 400px;
            overflow: auto;
            user-select: text;
          `}
        >
          {isCustom && hoverHelp && (
            <div
              css={css`
                padding: 0 4px;
                position: relative;
                display: flex;
                align-items: center;
                margin-top: 6px;
              `}
            >
              <div
                css={css`
                  width: 100%;
                  padding: 5px 12px;
                  display: grid;
                  grid-template-columns: [a] 32px [b] 1fr [c] 20px [d] 20px [e] 20px;
                  align-items: center;
                  color: ${props => props.theme.palette.text.light};
                `}
              >
                <span style={{ gridArea: 'a' }}>图标</span>
                <span style={{ gridArea: 'b', marginLeft: 8 }}>题单名称</span>
                <span style={{ gridArea: 'c' }}>编辑</span>
                <span style={{ gridArea: 'd' }}>删除</span>
                <span style={{ gridArea: 'e' }}>公开</span>
              </div>
            </div>
          )}
          {ids.map(idHash => (
            <FavoriteItem
              key={idHash}
              idHash={idHash}
              current={currentId === idHash}
              isCustom={isCustom}
              hoverHelp={hoverHelp}
            />
          ))}
        </ul>
      )}
      {isCustom && open && (
        <li
          css={css`
            padding: 4px 16px;
            position: relative;
            display: flex;
            align-items: center;
            margin-top: 6px;
          `}
        >
          {enableEdit ? (
            <Editor onSave={handleAddFavorite} onCancel={toggleEnableEdit} />
          ) : (
            <div
              css={css`
                width: 100%;
                padding: 1px 0;
                text-align: center;
                cursor: pointer;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: ${props =>
                  props.theme.palette.secondary.main};
                &:hover {
                  background-color: ${props =>
                    props.theme.palette.secondary.hover};
                }
              `}
              onClick={toggleEnableEdit}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M13 11h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4a1 1 0 112 0v7z"
                  clipRule="evenodd"
                />
              </svg>
              <span>创建新题单</span>
            </div>
          )}
        </li>
      )}
    </div>
  )
}

export default FavoriteList
