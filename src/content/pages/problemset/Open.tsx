import { useHover } from '@/hooks'
import { FC } from 'react'
import { css, keyframes } from 'styled-components/macro'

import SvgIcon from '@/components/SvgIcon'

export type Pos = { right: number; bottom: number }
interface OpenProps {
  onEnable?: () => void
  pos?: Pos
}

const defaultPos = { right: 30, bottom: 151 }

const makeMove = ({ right, bottom }: Pos) => keyframes`
  from {
    right: ${right}px;
    bottom: ${bottom}px;
  }

  to {
    right: 30px;
    bottom: 151px;
  }
`

const Open: FC<OpenProps> = ({ onEnable, pos }) => {
  const [ref, hover] = useHover()

  const handleClick = () => {
    if (onEnable) onEnable()
  }
  if (!pos) {
    pos = defaultPos
  }
  const move = makeMove(pos)

  return (
    <div
      ref={ref}
      css={css`
        position: fixed;
        animation: ${move} 0.5s ease-in 1 forwards;
        height: 48px;
        width: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 8px;
        background-color: rgb(40 40 40);
        color: rgba(239, 241, 246, 0.75);
        box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.24) 0px 1px 3px 0px,
          rgba(0, 0, 0, 0.16) 0px 2px 8px 0px;
      `}
      onClick={handleClick}
    >
      {hover ? (
        <div
          css={css`
            width: 26px;
            font-size: 12px;
          `}
        >
          打开评分
        </div>
      ) : (
        <div
          css={css`
            padding: 12px;
          `}
        >
          <SvgIcon>
            <path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
          </SvgIcon>
        </div>
      )}
    </div>
  )
}

export default Open
