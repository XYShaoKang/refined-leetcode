import { useEffect, useState, FC } from 'react'
import { Portal } from '@/components/Portal'
import { findElement } from '@/utils'
import { css } from 'styled-components/macro'
import { useAppDispatch, useAppSelector, useEffectMount } from '@/hooks'
import {
  selectOptions,
  toggleContestProblemShortcutKeyOption,
} from '../global/optionsSlice'
import { withPage } from '@/hoc'
import { useThrottle } from '@/hooks/useThrottle'

const ShortcutKeyOption: FC = () => {
  const options = useAppSelector(selectOptions)
  const [optionEl, setOptionEl] = useState<HTMLElement>()

  const disableShortcutKey =
    options && options.contestProblemsPage.disableShortcutkey
  const dispatch = useAppDispatch()

  const toggle = useThrottle(() => {
    dispatch(toggleContestProblemShortcutKeyOption())
  }, 500)

  useEffectMount(async state => {
    const handleClick = async () => {
      try {
        const content = await findElement(
          '.rc-dialog-body>.modal-body.description__21Ft'
        )
        if (!state.isMount) return
        setOptionEl(content)
      } catch (error) {
        //
      }
    }
    handleClick()
    const settingBtn = await findElement('.setting-btn')
    if (!state.isMount) return
    settingBtn.addEventListener('click', handleClick)
    state.unmount.push(
      () => settingBtn && settingBtn.removeEventListener('click', handleClick)
    )
  })

  useEffect(() => {
    if (!disableShortcutKey) return
    let editor: HTMLElement | null = null
    const handleClick = (e: KeyboardEvent) => {
      e.stopPropagation()
    }
    void (async function () {
      editor = await findElement('.editor-base')
      editor?.addEventListener('keydown', handleClick)
    })()
    return () => {
      editor && editor.removeEventListener('keydown', handleClick)
    }
  }, [disableShortcutKey])

  if (!optionEl) return <></>
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

export default withPage('contestProblemsPage')(ShortcutKeyOption)
