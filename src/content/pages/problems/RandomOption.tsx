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
          background-color: rgb(48 48 48);
          border-radius: 0.5rem;
          padding: 0.625rem;
          box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
            rgba(0, 0, 0, 0) 0px 0px 0px 0px,
            rgba(0, 0, 0, 0.24) 0px 1px 3px 0px,
            rgba(0, 0, 0, 0.16) 0px 6px 16px 0px;
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
              &:hover {
                background-color: rgb(255 255 255 / 7%);
              }
            `}
          >
            <input
              type="checkbox"
              id={key}
              name={key}
              checked={option[key]}
              onChange={toggle(key)}
              css={css`
                margin-right: 8px;
                cursor: pointer;
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
