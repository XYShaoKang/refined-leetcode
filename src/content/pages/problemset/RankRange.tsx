import {
  ChangeEventHandler,
  Dispatch,
  FC,
  KeyboardEventHandler,
  SetStateAction,
  useState,
} from 'react'

import { css } from 'styled-components/macro'
import { Input } from '@/components/Input'
import Button from '@/components/Button'

import {
  getId,
  parseParams,
  serializationPrams,
  ParamType,
  once,
} from './utils'
import { routerTo } from '@/utils'
import { ToolTip } from '@/components/ToolTip'
import CrownIcon from '@/components/icons/CrownIcon'
import { Box } from './AddQuestion'

const StyledInput: FC<{
  value: string
  setValue: Dispatch<SetStateAction<string>>
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
}> = ({ value, setValue, onKeyDown }) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
    setValue(e.target.value)
  }
  return (
    <Input
      type="number"
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      css={css`
        && {
          width: 80px;
          height: 20px;
          margin: 0 5px;
        }
      `}
    />
  )
}

const RankRange: FC = () => {
  const params: ParamType = parseParams()
  const [min, setMin] = useState(params.custom?.min ?? '')
  const [max, setMax] = useState(params.custom?.max ?? '')
  const [includePremium, setIncludePremium] = useState(
    params.custom?.includePremium ?? true
  )

  const handleApply = async (includePremium: boolean) => {
    const params: ParamType = parseParams()

    let id = getId(true)
    if (
      params.sorting?.[0].orderBy !== 'FRONTEND_ID' ||
      params.sorting?.[0].sortOrder === 'DESCENDING'
    ) {
      routerTo(
        location.pathname +
          '?' +
          serializationPrams({
            ...params,
            sorting: [{ orderBy: 'FRONTEND_ID', sortOrder: id }],
            custom: undefined,
          })
      )

      // 第一次是等待上面的跳转
      await once('routeChangeComplete')
      // 第二次是因为上面 sortOrder 使用 id，力扣会重新跳转到 sortOrder 为 ‘ASCENDING’ 的页面
      await once('routeChangeComplete')
    }
    id = getId(true)
    params.sorting = [{ orderBy: 'FRONTEND_ID', sortOrder: id }]
    params.custom = { ...params.custom, min, max, includePremium }
    const url = location.pathname + '?' + serializationPrams(params)
    routerTo(url)
  }
  const handleEnter: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.code === 'Enter') handleApply(includePremium)
  }
  const handleChangeIncludePremium = () => {
    setIncludePremium(!includePremium)
    handleApply(!includePremium)
  }
  return (
    <>
      <ToolTip title={includePremium ? '包含会员题' : '不含会员题'}>
        <Box onClick={handleChangeIncludePremium}>
          <CrownIcon
            color={includePremium ? 'rgb(255, 161, 22)' : 'rgb(104, 104, 104)'}
          />
        </Box>
      </ToolTip>
      <span>难度范围：</span>
      <StyledInput value={min} setValue={setMin} onKeyDown={handleEnter} />-
      <StyledInput value={max} setValue={setMax} onKeyDown={handleEnter} />
      <Button
        onClick={() => handleApply(includePremium)}
        css={css`
          && {
            width: 60px;
            height: 20px;
          }
        `}
      >
        应用
      </Button>
    </>
  )
}

export default RankRange
