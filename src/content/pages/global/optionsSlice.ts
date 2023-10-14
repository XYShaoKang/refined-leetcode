import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'

import store, { RootState } from '@/app/store'
import { OptionsType, PageName } from 'src/options/options'
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

function saveOption(options: OptionsType) {
  customEventDispatch('refinedLeetcodeSaveOptions', { options })
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
    disableProblemRating({ options }, { payload }: PayloadAction<PageName>) {
      if (options) {
        if (payload === 'problemsetPage') {
          options.problemsetPage.problemRating = false
        } else if (payload === 'problemListPage') {
          options.problemListPage.problemRating = false
        }
        saveOption(current(options))
      }
    },
    enableProblemRating({ options }, { payload }: PayloadAction<PageName>) {
      if (options) {
        if (payload === 'problemsetPage') {
          options.problemsetPage.problemRating = true
        } else if (payload === 'problemListPage') {
          options.problemListPage.problemRating = true
        }
        saveOption(current(options))
      }
    },
    toggleContestProblemShortcutKeyOption({ options }) {
      if (options) {
        options.contestProblemsPage.disableShortcutkey =
          !options.contestProblemsPage.disableShortcutkey
        saveOption(current(options))
      }
    },
    setOptions: (state, action) => {
      state.options = action.payload
    },
    setContestProblemViewWidth: (
      { options },
      { payload }: PayloadAction<string>
    ) => {
      if (options) {
        options.contestProblemsPage.problemViewWidth = payload
        saveOption(current(options))
      }
    },
  },
})

export const {
  setRandomOption,
  disableProblemRating,
  enableProblemRating,
  toggleContestProblemShortcutKeyOption,
  setOptions,
  setContestProblemViewWidth,
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
