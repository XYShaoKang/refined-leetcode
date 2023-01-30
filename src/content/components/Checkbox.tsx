import { ChangeEventHandler, FC } from 'react'
import { css } from 'styled-components/macro'
import {
  CheckBoxCheckedIcon,
  CheckBoxIndeterminateIcon,
  CheckBoxUncheckedIcon,
} from './icons'

interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
  size?: number
  color?: string
}

const Checkbox: FC<CheckboxProps> = ({
  checked,
  indeterminate,
  onChange,
  size,
  color,
}) => {
  const Icon = indeterminate
    ? CheckBoxIndeterminateIcon
    : checked
    ? CheckBoxCheckedIcon
    : CheckBoxUncheckedIcon
  const chandleChange: ChangeEventHandler<HTMLInputElement> = e => {
    onChange?.(e)
  }
  return (
    <span
      css={css`
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
      `}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={chandleChange}
        css={css`
          opacity: 0;
          position: absolute;
          margin: 0;
          padding: 0;
          left: 0;
          top: 0;
          height: 100%;
          width: 100%;
          cursor: pointer;
        `}
      />
      <Icon width={size} height={size} color={color} />
    </span>
  )
}

export default Checkbox
