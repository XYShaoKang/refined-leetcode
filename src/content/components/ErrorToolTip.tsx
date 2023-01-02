import { FC, ReactElement, ComponentProps } from 'react'
import { ToolTip } from './ToolTip'

interface ErrorToolTipOwnerProps {
  error: {
    message: string
    show: boolean
  }
  children: ReactElement
  onClose?: (e: any) => void
}

type ErrorToolTipProps = Omit<
  ComponentProps<typeof ToolTip>,
  keyof ErrorToolTipOwnerProps
> &
  ErrorToolTipOwnerProps

const ErrorToolTip: FC<
  Partial<ComponentProps<typeof ToolTip>> & ErrorToolTipOwnerProps
> = ({ error, children, ...props }: ErrorToolTipProps) => {
  return (
    <ToolTip
      {...props}
      open={error.show}
      title={error.message}
      arrow={false}
      style={{
        background: 'rgb(22, 11, 11)',
        color: 'rgb(244, 199, 199)',
        display: 'flex',
        whiteSpace: 'nowrap',
      }}
      icon={
        <svg
          viewBox="0 0 24 24"
          style={{
            width: 20,
            height: 20,
            color: 'rgb(244, 67, 54)',
            marginRight: 5,
          }}
        >
          <path
            d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
            fill="currentColor"
          />
        </svg>
      }
    >
      {children}
    </ToolTip>
  )
}

export default ErrorToolTip
