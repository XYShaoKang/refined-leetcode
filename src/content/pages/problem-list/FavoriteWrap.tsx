import { HelpIcon } from '@/components/icons'
import { useAppDispatch, useHover } from '@/hooks'
import { FC, useRef, useState } from 'react'
import { css } from 'styled-components/macro'
import AddFavorite from './AddFavorite'
import {
  saveFavorite,
  addFavorite,
  fetchFavoriteDetails,
  toggleFavoriteAuditStatus,
  updateShowName,
} from './favoriteSlice'
import HelpHead from './HelpHead'

interface FavoriteListProps {
  children: React.ReactNode
  title?: string | React.ReactNode
  onChange?: (e: React.MouseEvent) => void
  expanded?: boolean
  showHelp?: boolean
  showAdd?: boolean
}

const FavoriteWrap: FC<FavoriteListProps> = ({
  children,
  title,
  expanded: expandedProp,
  onChange,
  showHelp,
  showAdd,
}) => {
  const controlled = useRef(expandedProp !== undefined)
  const [expanded, setExpanded] = useState(expandedProp)
  const open = controlled.current ? expandedProp : expanded
  const [hoverHelpRef, hoverHelp] = useHover()
  const [enableEdit, setEnableEdit] = useState(false)
  const dispatch = useAppDispatch()

  const toggleEnableEdit = () => {
    setEnableEdit(enableEdit => !enableEdit)
  }
  const handleAddFavorite = async (text: string) => {
    const { ok, favoriteIdHash } = await dispatch(saveFavorite(text)).unwrap()
    if (ok) {
      await dispatch(addFavorite(favoriteIdHash))
      await dispatch(fetchFavoriteDetails([favoriteIdHash]))
      await dispatch(toggleFavoriteAuditStatus(favoriteIdHash))
      await dispatch(updateShowName({ idHash: favoriteIdHash, showName: text }))
    }
    toggleEnableEdit()
  }

  const toggle = (e: React.MouseEvent) => {
    if (!controlled.current) {
      setExpanded(expanded => !expanded)
    }
    if (onChange) {
      onChange(e)
    }
  }

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
      {title && (
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
          <div style={{ width: '100%' }}>
            <div
              css={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
              `}
            >
              <span>{title}</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {showHelp && (
                  <div ref={hoverHelpRef} onClick={e => e.stopPropagation()}>
                    <HelpIcon height={20} />
                  </div>
                )}
              </div>
            </div>
          </div>
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
      )}
      {open && (
        <>
          {showHelp && hoverHelp && <HelpHead />}
          {children}
          {showAdd && (
            <AddFavorite
              enableEdit={enableEdit}
              onSave={handleAddFavorite}
              onCancel={toggleEnableEdit}
              toggleEnableEdit={toggleEnableEdit}
            />
          )}
        </>
      )}
    </div>
  )
}

export default FavoriteWrap
