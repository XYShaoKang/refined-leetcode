import { createSlice } from '@reduxjs/toolkit'

import { RootState } from '@/app/store'

export interface RandomOptionType {
  skipAC: boolean
}

export const labelOfKey = {
  skipAC: '跳过已解答题目',
}

const defaultRandomOption = (): RandomOptionType => ({ skipAC: false })

interface OptionState {
  random: {
    [key: string]: RandomOptionType
  }
}

const initialState: OptionState = {
  random: {
    all: defaultRandomOption(),
  },
}

export const optionSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setRandomOption: (state, action) => {
      const { favorite, option } = action.payload

      state.random[favorite] = {
        ...(state.random[favorite] ?? defaultRandomOption()),
        ...option,
      }
    },
  },
})

export const { setRandomOption } = optionSlice.actions

export const selectRandomOption = (
  state: RootState,
  key: string
): RandomOptionType => state.option.random[key] ?? defaultRandomOption()

export default optionSlice.reducer
