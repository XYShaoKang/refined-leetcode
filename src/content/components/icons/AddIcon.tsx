import SvgIcon, { SvgIconProps } from '../SvgIcon'

const AddIcon: React.FC<SvgIconProps> = props => {
  return (
    <SvgIcon {...props}>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </SvgIcon>
  )
}

export default AddIcon
