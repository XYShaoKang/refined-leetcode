import { useRef, useState } from 'react'

interface SwitchProps {
  enable?: boolean
  height?: number
  width?: number
  onToggle?: () => void
}

const Switch: React.FC<SwitchProps> = ({
  enable: enableProp,
  height,
  width,
  onToggle,
}) => {
  const { current: isControlled } = useRef(enableProp !== undefined)
  const [state, setState] = useState<boolean>()
  const handleToggle = () => {
    setState(!state)
    if (onToggle) onToggle()
  }
  if (height === undefined && width === undefined) height = 24
  const enable = isControlled ? enableProp : state
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ width, height, cursor: 'pointer' }}
      onClick={handleToggle}
    >
      {enable ? (
        <path
          d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
          fill="currentColor"
          color="rgb(144, 202, 249)"
        />
      ) : (
        <path
          d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
          fill="currentColor"
        />
      )}
    </svg>
  )
}

export default Switch
