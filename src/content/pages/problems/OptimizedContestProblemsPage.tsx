import { createGlobalStyle } from 'styled-components/macro'
import { useAppDispatch, useAppSelector, useEffectMount } from '@/hooks'
import { debounce } from 'src/utils'
import { useCallback, useEffect, useState } from 'react'
import { selectOptions } from '@/pages/global/optionsSlice'
import { Portal } from '@/components/Portal'
import { setContestProblemViewWidth } from '../global/optionsSlice'

const GlobalStyle = createGlobalStyle`
  body {
    display: flex;
    flex-direction: column;
  }

  body .content-wrapper {
    height: 0;
    min-height: 0 !important;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-bottom: 0 !important;
  }

  .content-wrapper #base_content {
    display: flex;
    overflow: hidden;
    height: 0;
    flex: 1;
    flex-direction: var(--layout-direction, row);
  }

  .content-wrapper #base_content.is-reverse {
    flex-direction: row-reverse;
  }

  .content-wrapper #base_content > .container {
    width: var(--problem-view-width);
    overflow: scroll;
  }

  .content-wrapper #base_content > .container .question-content {
    overflow: unset !important;
  }

  .content-wrapper #base_content > .container .question-content > pre {
    white-space: break-spaces;
  }

  .content-wrapper #base_content > .editor-container {
    flex: 1;
    overflow: scroll;
  }

  .content-wrapper #base_content > .editor-container .container {
    width: 100% !important;
  }

  .content-wrapper #base_content > .resize-container {
    width: 6px;
    height: 100%;
    margin: 0 2px;
    position: relative;
  }

  .resize-container .custom-resize {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #eee;
    cursor: ew-resize;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: .2s all;
  }

  .resize-container .custom-resize:hover {
    background: #1a90ff;
  }

  .resize-container .custom-resize .resize-dot {
    width: 2px;
    height: 2px;
    background-color: #666;
    border-radius: 50%;
  }

  .resize-container .custom-resize:hover .resize-dot {
    background-color: white;
  }

  .resize-container .custom-resize .resize-dot:not(:first-of-type) {
    margin-top: 3px;
  }
`

const Variables = createGlobalStyle<{
  $problemViewWidth?: string
  $layoutDirection?: 'row' | 'row-reverse'
}>`
  :root {
    --problem-view-width: ${props => props.$problemViewWidth || '40%'};
    --layout-direction: ${props => props.$layoutDirection ?? 'row'}
  }
`

const checkUrl = () =>
  // 插件暂时没支持国际服，先留着吧
  /^https:\/\/leetcode.(cn|com)\/contest\/(bi)?weekly-contest-\d+\/problems\/.+$/.test(
    window.location.href
  )

export const OptimizedContestProblemsPage = (): JSX.Element => {
  const options = useAppSelector(selectOptions)
  const dispatch = useAppDispatch()

  const [isTargetPage, setIsTargetPage] = useState(checkUrl())

  const modifyPageLayout = !!options?.contestProblemsPage.modifyPageLayout
  const reverseLayout = !!options?.contestProblemsPage.reverseLayout
  const problemViewWidth = options?.contestProblemsPage.problemViewWidth

  const [currentResize, setCurrentResize] = useState({
    isResizing: false,
    startX: 0,
    currentX: 0,
    initialSize: 0,
  })

  const newSize = (state: typeof currentResize, isReverse: boolean) => {
    const deltaX = state.currentX - state.startX
    return state.initialSize + (isReverse ? -deltaX : deltaX)
  }

  const baseContent = document.querySelector(
    '.content-wrapper #base_content'
  ) as HTMLElement | null
  if (baseContent?.children.length == 2) {
    const $resizeContainer = document.createElement('div')
    baseContent.insertBefore($resizeContainer, baseContent.children[1])
    $resizeContainer.classList.add('resize-container')
  }

  useEffectMount(state => {
    const handle = debounce(() => {
      if (state.isMount) {
        setIsTargetPage(checkUrl())
      }
    }, 100)
    window.addEventListener('urlchange', handle)
    state.unmount.push(() => {
      handle.cancel()
      window.removeEventListener('urlchange', handle)
    })
  }, [])

  const onMouseDown = useCallback(e => {
    if (!baseContent?.children[0]) return
    e.preventDefault()
    setCurrentResize({
      isResizing: true,
      initialSize: baseContent?.children[0].getBoundingClientRect().width,
      startX: e.clientX,
      currentX: e.clientX,
    })
  }, [])

  const onMouseMove = useCallback(
    e => {
      if (!currentResize.isResizing) return
      e.preventDefault()
      setCurrentResize(state => ({
        ...state,
        currentX: e.clientX,
      }))
    },
    [currentResize]
  )

  const onMouseUp = useCallback(
    e => {
      if (!currentResize.isResizing) return
      e.preventDefault()
      setCurrentResize(state => {
        return {
          ...state,
          isResizing: false,
          currentX: e.clientX,
        }
      })
      Promise.resolve().then(() => {
        dispatch(
          setContestProblemViewWidth(
            `${newSize(currentResize, reverseLayout)}px`
          )
        )
      })
    },
    [currentResize, reverseLayout]
  )

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return (
    <>
      {modifyPageLayout && isTargetPage && <GlobalStyle />}
      <Variables
        $layoutDirection={reverseLayout ? 'row-reverse' : 'row'}
        $problemViewWidth={
          currentResize.isResizing
            ? `${newSize(currentResize, reverseLayout)}px`
            : problemViewWidth
        }
      />
      {baseContent && (
        <Portal container={baseContent.children[1] as HTMLElement}>
          <div
            className={'custom-resize'}
            onMouseDown={onMouseDown}
            style={{
              background: currentResize.isResizing ? '#1a90ff' : undefined,
            }}
          >
            {Array(3)
              .fill(0)
              .map(() => (
                <div
                  className={'resize-dot'}
                  style={{
                    background: currentResize.isResizing ? 'white' : undefined,
                  }}
                />
              ))}
          </div>
        </Portal>
      )}
    </>
  )
}
