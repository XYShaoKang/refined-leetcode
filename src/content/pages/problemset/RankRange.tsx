import {
  ChangeEventHandler,
  Dispatch,
  FC,
  KeyboardEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from 'react'

import { css } from 'styled-components/macro'
import { Input } from '@/components/Input'
import Button from '@/components/Button'

import {
  getId,
  parseParams,
  serializationPrams,
  OrderBy,
  ParamType,
  once,
} from './utils'
import { routerTo } from '@/utils'

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
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')

  useEffect(() => {
    const params: ParamType = parseParams()
    setMin(params.custom?.min ?? '')
    setMax(params.custom?.max ?? '')
  }, [])

  const handleApply = async () => {
    const params: ParamType = parseParams()
    let orderBy: OrderBy = 'FRONTEND_ID'

    const sortOrder = params.sorting?.[0].sortOrder
    let id = getId(true)
    if (sortOrder && sortOrder !== 'DESCENDING') {
      orderBy = params.sorting![0].orderBy
    } else {
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
    params.sorting = [{ orderBy, sortOrder: id }]
    params.custom = { ...params.custom, min, max }

    const url = location.pathname + '?' + serializationPrams(params)
    routerTo(url)
  }
  const handleEnter: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.code === 'Enter') handleApply()
  }
  return (
    <>
      <span>难度范围：</span>
      <StyledInput value={min} setValue={setMin} onKeyDown={handleEnter} />-
      <StyledInput value={max} setValue={setMax} onKeyDown={handleEnter} />
      <Button
        onClick={handleApply}
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
