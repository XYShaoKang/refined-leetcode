import { forwardRef, ForwardedRef } from 'react'

import { useAppSelector, useAppDispatch } from '@/hooks'
import PopperUnstyled, { Placement } from '@/components/PopperUnstyled'

import {
  selectRandomOption,
  RandomOptionType,
  setRandomOption,
  labelOfKey,
} from '../global/optionSlice'
import { css } from 'styled-components/macro'

interface RandomOptionProps {
  anchorEl?: HTMLElement | null
  placement?: Placement
  favorite: string
}

type RandomOptionKey = keyof RandomOptionType

const RandomOption = forwardRef(function RandomOption(
  { favorite, ...props }: RandomOptionProps,
  ref: ForwardedRef<any>
) {
  const option = useAppSelector(state => selectRandomOption(state, favorite))
  const dispatch = useAppDispatch()
  const toggle = (key: RandomOptionKey) => () => {
    dispatch(
      setRandomOption({
        favorite,
        option: { ...option, [key]: !option[key] },
      })
    )
  }
  const keys: RandomOptionKey[] = Object.keys(option) as any

  return (
    <PopperUnstyled
      placement="right"
      {...props}
      style={{ zIndex: 999 }}
      ref={ref}
      as="div"
      offset={{ top: 10, left: 0 }}
    >
      <div
        css={css`
          background-color: ${props => props.theme.palette.primary.light};
          border-radius: 0.5rem;
          padding: 0.625rem;
          box-shadow: ${props => props.theme.shadows[1]};
          margin-left: 10px;
        `}
      >
        {keys.map(key => (
          <li
            key={key}
            css={css`
              list-style: none;
              padding: 6px 20px 6px 8px;
              margin: 0;
              display: flex;
              align-items: center;
              cursor: pointer;
              border-radius: 4px;
              &:hover {
                background-color: rgb(255 255 255 / 7%);
              }
              color: ${({ theme }) => theme.palette.text.light};
            `}
          >
            <input
              type="checkbox"
              id={key}
              name={key}
              checked={option[key]}
              onChange={toggle(key)}
              css={css`
                appearance: none;
                margin-right: 8px;
                cursor: pointer;
                color: currentColor;
                border-radius: 4px;
                width: 16px;
                height: 16px;
                background-color: ${props =>
                  props.theme.palette.checkbox.backgroundColor};
                &:checked {
                  background-color: ${props =>
                    props.theme.palette.checkbox.checkedBackgroundColor};
                }
                &:checked::before {
                  content: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16px" height="16px" fill="rgb(255 255 255)" aria-hidden="true"%3E%3Cpath fill-rule="evenodd" d="M9.688 15.898l-3.98-3.98a1 1 0 00-1.415 1.414L8.98 18.02a1 1 0 001.415 0L20.707 7.707a1 1 0 00-1.414-1.414l-9.605 9.605z" clip-rule="evenodd"%3E%3C/path%3E%3C/svg%3E');
                }
              `}
            />
            <label
              htmlFor={key}
              css={css`
                cursor: pointer;
              `}
            >
              {labelOfKey[key]}
            </label>
          </li>
        ))}
      </div>
    </PopperUnstyled>
  )
})

export default RandomOption
