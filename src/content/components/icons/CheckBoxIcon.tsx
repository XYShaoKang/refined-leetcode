import SvgIcon, { SvgIconProps } from '../SvgIcon'

export const CheckBoxCheckedIcon: React.FC<SvgIconProps> = props => {
  return (
    <SvgIcon {...props}>
      <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </SvgIcon>
  )
}

export const CheckBoxUncheckedIcon: React.FC<SvgIconProps> = props => {
  return (
    <SvgIcon {...props}>
      <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
    </SvgIcon>
  )
}

export const CheckBoxIndeterminateIcon: React.FC<SvgIconProps> = props => {
  return (
    <SvgIcon {...props}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z" />
    </SvgIcon>
  )
}
