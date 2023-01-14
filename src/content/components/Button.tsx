import { ForwardedRef, forwardRef, ReactNode } from 'react'
import styled from 'styled-components/macro'

import { SCProps, StyledComponent } from './utils'
import { rotate360Deg } from './animation'

interface ButtonOwnerProps {
  disabled?: boolean
  loading?: boolean
  children: ReactNode
}

const Button: StyledComponent<ButtonOwnerProps, 'button'> = forwardRef(
  function Button<AsC extends string | React.ComponentType = 'span'>(
    { children, disabled, loading, ...props }: SCProps<ButtonOwnerProps, AsC>,
    ref: ForwardedRef<AsC>
  ) {
    return (
      <ButtonStyled ref={ref} disabled={disabled || loading} {...props}>
        {loading ? <Loading /> : children}
      </ButtonStyled>
    )
  }
)

export default Button

const Loading = styled.div`
  border-radius: 50%;
  background: linear-gradient(to right, #fff 10%, rgba(128, 0, 255, 0) 42%);
  position: relative;
  transform: translateZ(0);
  height: 16px;
  width: 16px;
  animation: ${rotate360Deg} 0.1s infinite linear;
  &::before {
    width: 50%;
    height: 50%;
    background: #fff;
    border-radius: 100% 0 0 0;
    position: absolute;
    top: 0;
    left: 0;
    content: '';
  }
  &::after {
    background-color: ${props => props.theme.palette.button.disable};
    width: 75%;
    height: 75%;
    border-radius: 50%;
    content: '';
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
`

const ButtonStyled = styled.button.attrs<{ disabled?: boolean }>(props => ({
  disable: props.disabled,
}))`
  flex-shrink: 0;
  width: 70px;
  color-scheme: dark;
  font-feature-settings: 'tnum';
  box-sizing: border-box;
  margin: 0;
  border: none;
  line-height: 20px;
  outline: none;
  user-select: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition-property: color, box-shadow, background-color, opacity;
  transition-duration: 0.3s;
  overflow: hidden;
  cursor: ${props => (props.disabled ? '' : 'pointer')};
  opacity: 1;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 8px;
  color: ${props => props.theme.palette.button.text};
  background-color: ${props =>
    props.disabled
      ? props.theme.palette.button.disable
      : props.theme.palette.button.main};
  &:hover {
    background-color: ${props =>
      props.disabled ? '' : `${props.theme.palette.button.hover};`};
  }
  &:focus {
    background-color: ${props =>
      props.disabled ? '' : `${props.theme.palette.button.hover};`};
  }
`
