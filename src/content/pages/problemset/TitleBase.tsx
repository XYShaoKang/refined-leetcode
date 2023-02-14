import { MouseEventHandler, ReactElement, forwardRef } from 'react'
import { css } from 'styled-components/macro'

import { ToolTip } from '@/components/ToolTip'

interface TitleProps {
  title: string
  help?: ReactElement | string
  showHelpIcon?: boolean
  isSort?: boolean
  sortOrder?: string | number
  onSort?: (...args: any) => void
}

const TitleBase = forwardRef<HTMLDivElement, TitleProps>(function TitleBase(
  { title, help, isSort, sortOrder, onSort, showHelpIcon },
  ref
) {
  const handleClick: MouseEventHandler<HTMLDivElement> = e => {
    if (e.currentTarget.contains(e.target as any)) {
      e.nativeEvent.stopImmediatePropagation()
      if (onSort && typeof onSort === 'function') {
        onSort()
      }
    }
  }
  return (
    <div
      ref={ref}
      data-refined-leetcode
      css={css`
        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 11px 0px;
        &:hover > span,
        &:hover > div {
          color: ${props =>
            props.theme.mode === 'dark' ? '#b3b3b3' : '#595959'};
        }
      `}
      onClick={handleClick}
    >
      <ToolTip
        placement="bottom"
        keep={true}
        css={css`
          ${props =>
            props.theme.mode === 'dark'
              ? css`
                  && {
                    background: #e9e9e9;
                    color: #1a1a1a;
                    font-weight: bold;
                  }
                  &&::before {
                    border-bottom-color: #e9e9e9;
                  }
                `
              : css`
                  && {
                    background: #2a2a2a;
                    color: #fff;
                    font-weight: bold;
                  }
                  &&::before {
                    border-bottom-color: #2a2a2a;
                  }
                `}
        `}
        title={help ?? ''}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            color: ${props =>
              props.theme.mode === 'dark' ? '#eff2f699' : '#3c3c4399'};
          `}
        >
          <span
            css={css`
              color: ${props =>
                props.theme.mode === 'dark' ? '#eff2f699' : '#3c3c4399'};
            `}
          >
            {title}
          </span>
          {showHelpIcon && (
            <svg
              viewBox="0 0 24 24"
              style={{
                height: 15,
                fill: 'currentColor',
              }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
            </svg>
          )}
        </div>
      </ToolTip>
      {!!onSort && (
        <div
          css={css`
            color: ${props =>
              props.theme.mode === 'dark' ? '#5c5c5c' : '#bfbfbf'};
          `}
        >
          {!isSort ? (
            <svg
              viewBox="0 0 24 24"
              css={css`
                width: 14px;
                height: 14px;
              `}
            >
              <path
                d="M18.695 9.378L12.83 3.769a1.137 1.137 0 00-.06-.054c-.489-.404-1.249-.377-1.7.06L5.303 9.381a.51.51 0 00-.16.366c0 .297.27.539.602.539h12.512a.64.64 0 00.411-.146.501.501 0 00.028-.762zM12.77 20.285c.021-.017.042-.035.062-.054l5.863-5.609a.5.5 0 00-.028-.762.64.64 0 00-.41-.146H5.743c-.332 0-.601.242-.601.54a.51.51 0 00.16.365l5.769 5.606c.45.437 1.21.464 1.698.06z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 14 14"
              css={css`
                width: 14px;
                height: 14px;
              `}
            >
              {sortOrder === 'DESCENDING' ? (
                <path
                  d="M7.44926 11.8332C7.46161 11.8229 7.47354 11.8123 7.48504 11.8013L10.9052 8.52958C11.0376 8.4029 11.0305 8.20389 10.8893 8.08509C10.8243 8.03043 10.7385 8.00001 10.6495 8.00001H3.35053C3.15694 8.00001 3 8.1408 3 8.31447C3 8.39354 3.0332 8.46971 3.09299 8.5278L6.45859 11.7977C6.72125 12.0529 7.16479 12.0688 7.44926 11.8332Z"
                  fill="currentColor"
                />
              ) : (
                <path
                  d="M10.9052 5.47044L7.48504 2.19872C7.47354 2.18772 7.46161 2.1771 7.44926 2.16687C7.16479 1.93123 6.72125 1.94709 6.45859 2.20229L3.09299 5.47222C3.0332 5.53031 3 5.60648 3 5.68555C3 5.85922 3.15694 6.00001 3.35053 6.00001H10.6495C10.7385 6.00001 10.8243 5.96959 10.8893 5.91493C11.0305 5.79613 11.0376 5.59712 10.9052 5.47044Z"
                  fill="currentColor"
                />
              )}
            </svg>
          )}
        </div>
      )}
    </div>
  )
})
export default TitleBase
