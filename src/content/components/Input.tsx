import styled from 'styled-components/macro'

export const Input = styled.input`
  overflow: visible;
  height: 32px;
  outline: none;
  border-radius: 8px !important;
  box-sizing: border-box;
  width: 100%;
  padding: 4px 11px;
  font-size: 14px;
  line-height: 1.5715;
  border: 1px solid rgba(0, 0, 0, 0);
  transition: all 0.3s;
  touch-action: manipulation;
  text-overflow: ellipsis;
  color: ${props => props.theme.palette.text.main};
  background: ${props => props.theme.palette.secondary.main};
  &:focus {
    background-color: ${props => props.theme.palette.secondary.hover};
  }
`
