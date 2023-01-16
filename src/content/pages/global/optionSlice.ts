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
  problemRating: {
    enable: boolean
  }
  contestProblem: {
    disableShortcutKey: boolean
  }
}

const initialState: OptionState = {
  random: {
    all: defaultRandomOption(),
  },
  problemRating: {
    enable: true,
  },
  contestProblem: {
    disableShortcutKey: false,
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
    disableProblemRating(state) {
      state.problemRating.enable = false
    },
    enableProblemRating(state) {
      state.problemRating.enable = true
    },
    toggleContestProblemShortcutKeyOption(state) {
      state.contestProblem.disableShortcutKey =
        !state.contestProblem.disableShortcutKey
    },
  },
})

export const {
  setRandomOption,
  disableProblemRating,
  enableProblemRating,
  toggleContestProblemShortcutKeyOption,
} = optionSlice.actions

export const selectRandomOption = (
  state: RootState,
  key: string
): RandomOptionType => state.option.random[key] ?? defaultRandomOption()

export const selectProblemRatingOption = (
  state: RootState
): OptionState['problemRating'] => state.option.problemRating

export const selectContestProblemShortcutKeyOption = (
  state: RootState
): OptionState['contestProblem'] => state.option.contestProblem

export default optionSlice.reducer
