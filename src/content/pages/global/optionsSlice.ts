import { createSlice, current } from '@reduxjs/toolkit'

import store, { RootState } from '@/app/store'
import { OptionsType } from 'src/options/options'
import { customEventDispatch } from '@/utils'

export interface RandomOptionType {
  skipAC: boolean
}

export const labelOfKey = {
  skipAC: '跳过已解答题目',
}

const defaultRandomOption = (): RandomOptionType => ({ skipAC: false })

interface OptionsState {
  random: {
    [key: string]: RandomOptionType
  }
  options?: OptionsType
}

const initialState: OptionsState = {
  random: {
    all: defaultRandomOption(),
  },
}

export const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setRandomOption: (state, action) => {
      const { favorite, option } = action.payload

      state.random[favorite] = {
        ...(state.random[favorite] ?? defaultRandomOption()),
        ...option,
      }
    },
    disableProblemRating({ options }) {
      if (options) {
        options.problemsetPage.problemRating = false
        customEventDispatch('refinedLeetcodeSaveOptions', {
          options: current(options),
        })
      }
    },
    enableProblemRating({ options }) {
      if (options) {
        options.problemsetPage.problemRating = true
        customEventDispatch('refinedLeetcodeSaveOptions', {
          options: current(options),
        })
      }
    },
    toggleContestProblemShortcutKeyOption({ options }) {
      if (options) {
        options.contestProblemsPage.disableShortcutkey =
          !options.contestProblemsPage.disableShortcutkey
        customEventDispatch('refinedLeetcodeSaveOptions', {
          options: current(options),
        })
      }
    },
    setOptions: (state, action) => {
      state.options = action.payload
    },
  },
})

export const {
  setRandomOption,
  disableProblemRating,
  enableProblemRating,
  toggleContestProblemShortcutKeyOption,
  setOptions,
} = optionsSlice.actions

export const selectRandomOption = (
  state: RootState,
  key: string
): RandomOptionType => state.options.random[key] ?? defaultRandomOption()

export const selectOptions = (state: RootState): OptionsType | undefined =>
  state.options.options

window.addEventListener('refinedLeetcodeOptionsChange', e => {
  store.dispatch(setOptions(e.detail.options))
})

export default optionsSlice.reducer
