import styled from 'styled-components/macro'

export const Button = styled.button.attrs<{ disabled?: boolean }>(props => ({
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
`
