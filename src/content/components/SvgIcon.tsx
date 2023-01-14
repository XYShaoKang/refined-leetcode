interface SvgIconProps {
  children?: React.ReactNode
  height?: number
}
const SvgIcon: React.FC<SvgIconProps> = ({ children, height = 24 }) => {
  return (
    <svg viewBox="0 0 24 24" height={height} fill="currentColor">
      {children}
    </svg>
  )
}

export default SvgIcon
