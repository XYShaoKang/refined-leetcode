import { FC } from 'react'
import 'styled-components/macro'

/** 实现扭曲糢糊效果
 *
 * 通过 CSS 中的 filter 使用
 */
const DistortSvg: FC = () => {
  return (
    <svg
      css={`
        display: none;
      `}
    >
      <filter
        id="refined-leetcode-noise"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
      >
        <feTurbulence baseFrequency="0 0.1" result="NOISE" numOctaves="4" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="NOISE"
          scale="20"
          xChannelSelector="R"
          yChannelSelector="R"
        />
      </filter>
    </svg>
  )
}

export default DistortSvg
