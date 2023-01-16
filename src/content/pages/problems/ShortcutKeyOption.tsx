import { useEffect, useState, FC } from 'react'
import { Portal } from '@/components/Portal'
import { findElement } from '@/utils'
import { css } from 'styled-components/macro'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  selectContestProblemShortcutKeyOption,
  toggleContestProblemShortcutKeyOption,
} from '../global/optionSlice'
import { withRoot } from '@/hoc'

const ShortcutKeyOption: FC = () => {
  const [optionEl, setOptionEl] = useState<HTMLElement>()
  const { disableShortcutKey } = useAppSelector(
    selectContestProblemShortcutKeyOption
  )
  const dispatch = useAppDispatch()

  const toggle = () => {
    dispatch(toggleContestProblemShortcutKeyOption())
  }
  useEffect(() => {
    let settingBtn: HTMLElement
    const handleClick = async () => {
      const content = await findElement(
        '.rc-dialog-body>.modal-body.description__21Ft'
      )
      setOptionEl(content)
    }
    handleClick()

    void (async function () {
      settingBtn = await findElement('.setting-btn')
      settingBtn.addEventListener('click', handleClick)
    })()
    return () => {
      settingBtn && settingBtn.removeEventListener('click', handleClick)
    }
  }, [])

  useEffect(() => {
    if (!disableShortcutKey) return
    let editor: HTMLElement | null = null
    const handleClick = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }
    void (async function () {
      editor = await findElement('.editor-base')
      editor.addEventListener('keydown', handleClick)
    })()
    return () => {
      editor && editor.removeEventListener('keydown', handleClick)
    }
  }, [disableShortcutKey])

  if (!optionEl) return <div />
  return (
    <Portal container={optionEl}>
      <hr className="base-line__Agul line dotted" />
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: bold;
          font-size: 16px;
        `}
      >
        <div>禁用快捷键</div>

        <svg
          viewBox="0 0 24 24"
          style={{ width: 50, height: 50, cursor: 'pointer' }}
          onClick={toggle}
        >
          {disableShortcutKey ? (
            <path
              d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
              fill="currentColor"
              color="rgb(144, 202, 249)"
            />
          ) : (
            <path
              d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
              fill="currentColor"
            />
          )}
        </svg>
      </div>
    </Portal>
  )
}

export default withRoot(ShortcutKeyOption)
