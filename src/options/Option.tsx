import Checkbox from '@/components/Checkbox'
import Switch from '@/components/Switch'
import React, { FC, useEffect, useState } from 'react'
import { css } from 'styled-components/macro'

import { defaultOptions, labelMap, OptionsType } from './options'

const storage = chrome.storage.local

const mergeOptions = (
  options?: OptionsType
): [[string, [string, boolean][]][], boolean, boolean] => {
  const res: [string, [string, boolean][]][] = []
  let allItem = 0,
    enableItem = 0
  for (const page of Reflect.ownKeys(defaultOptions)) {
    const ans: [string, [string, boolean][]] = [page as string, []]
    for (const key of Reflect.ownKeys((defaultOptions as any)[page])) {
      allItem++
      const enable =
        (options as any)?.[page]?.[key] ?? (defaultOptions as any)[page][key]
      if (enable) enableItem++
      ans[1].push([key as string, enable])
    }
    res.push(ans)
  }
  return [res, !!enableItem, enableItem > 0 && enableItem < allItem]
}

const Option: FC = () => {
  const [state, setOptions] =
    useState<[[string, [string, boolean][]][], boolean, boolean]>()
  useEffect(() => {
    storage.get('options').then(({ options }) => {
      setOptions(mergeOptions(options))
    })
  }, [])
  useEffect(() => {
    const handle = (e: { [key: string]: chrome.storage.StorageChange }) => {
      if ('options' in e) {
        const options = e.options.newValue
        setOptions(mergeOptions(options))
      }
    }
    chrome.storage.onChanged.addListener(handle)
    return () => {
      chrome.storage.onChanged.removeListener(handle)
    }
  }, [])
  const handleChange = (args: string[][], enable?: boolean) => () => {
    storage.get('options').then(({ options }) => {
      for (const [page, key] of args) {
        if (enable !== undefined) {
          options[page][key] = enable
        } else {
          options[page][key] = !options[page][key]
        }
      }
      setOptions(mergeOptions(options))
      storage.set({ options })
    })
  }
  if (!state) return null
  const [options, hasEnable, indeterminate] = state

  return (
    <div
      css={css`
        width: 200px;
        padding: 3px;
        background: #191919;
      `}
    >
      <div
        css={css`
          padding: 10px;
          border-radius: 5px;
          background: #282828;
          color: #eff2f6ba;
          box-shadow: 0 1px 2px #0000004c, 0 4px 4px #0000003f;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: flex-end;
          `}
        >
          <label
            htmlFor="selectAll"
            css={css`
              cursor: pointer;
            `}
          >
            {hasEnable ? '全部禁用' : '全部启用'}
          </label>
          <Checkbox
            id="selectAll"
            checked={hasEnable}
            indeterminate={indeterminate}
            onChange={() =>
              handleChange(
                options
                  .map(([page, features]) =>
                    features.map(([key]) => [page, key])
                  )
                  .flat(),
                !hasEnable
              )()
            }
            size={20}
            color={hasEnable ? 'rgb(144, 202, 249)' : ''}
          />
        </div>
        {options?.map(([page, features], i) => {
          const enableItems = features.filter(([, e]) => e)
          const hasEnable =
            enableItems.length > 0 && enableItems.length < features.length
          return (
            <div
              key={page}
              css={css`
                border-bottom: ${i < options.length - 1
                  ? '2px solid #6f6f6fb0'
                  : ''};
              `}
            >
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  margin-top: 5px;
                `}
              >
                <h2
                  css={css`
                    font-size: 16px;
                    margin: 0;
                  `}
                >
                  {labelMap[page]}
                </h2>
                <Checkbox
                  checked={!!enableItems.length}
                  indeterminate={hasEnable}
                  onChange={handleChange(
                    features.map(([key]) => [page, key]),
                    !enableItems.length
                  )}
                  size={20}
                  color={enableItems.length ? 'rgb(144, 202, 249)' : ''}
                />
              </div>
              {features.map(([key, enable]) => (
                <div
                  key={key}
                  css={css`
                    margin-left: 10px;
                  `}
                >
                  <div
                    onClick={handleChange([[page, key]])}
                    css={css`
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      cursor: pointer;
                    `}
                  >
                    <div>{labelMap[key]}</div>
                    <Switch enable={enable} />
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Option
