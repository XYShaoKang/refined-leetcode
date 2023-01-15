import { FC, useEffect, useState } from 'react'
import { css } from 'styled-components/macro'

import { useAppSelector } from '@/hooks'

import {
  OrderBy,
  ParamType,
  parseParams,
  serializationPrams,
  getId,
  once,
  SORT_KEY,
} from './utils'
import TitleBase from './TitleBase'
import { Portal } from '@/components/Portal'
import { routerTo } from '@/utils'
import { selectIsPremium } from '../global/globalSlice'

interface RankTitleProps {
  otherRoots: { [key in OrderBy]?: HTMLElement }
}

const RankTitle: FC<RankTitleProps> = ({ otherRoots }) => {
  const [params, setParams] = useState(parseParams())
  const isPremium = useAppSelector(selectIsPremium)

  useEffect(() => {
    SORT_KEY.forEach(({ key }) => {
      const child = otherRoots[key]?.children[0]
      if (child && child instanceof HTMLElement) {
        child.style.display = 'none'
      }
    })
    return () => {
      SORT_KEY.forEach(({ key }) => {
        const child = otherRoots[key]?.children[0]
        if (child && child instanceof HTMLElement) {
          child.style.display = 'flex'
          child.style.padding = '11px 0'
        }
      })
    }
  }, [])

  useEffect(() => {
    // 如果第一次访问的 url 中，包含 customSort，则需要进行特殊的处理。
    void (async function () {
      if (params.custom) {
        // 如果包含 customSort，那么一定是包含 id 的 sroting，则一定会重定向一次。
        await once('routeChangeComplete')

        handleCustomSort()()
      }
    })()
  }, [])

  const handleCustomSort = (key?: OrderBy, isSwitch?: boolean) => async () => {
    if (!key) key = 'FRONTEND_ID'
    const tmp: ParamType = { ...params }
    const orderBy: OrderBy = 'FRONTEND_ID'

    /** 判断当前 url 中的 sortOrder 是否为 ASCENDING，或者等于 id.current
     *
     *  如果不是的话，直接跳转会被导航到包含 {sortOrder,orderBy} 的 url，
     *  而这样对这个 url 返回结果的话，会被缓存，而之后如果取消自定义排序，
     *  而进行对应的 {sortOrder,orderBy} 去排序时，则会使用这次缓存的结果，
     *  导致数据错误，所以这种情况下，需要先跳转到 sortOrder=‘ASCENDING’ 的 url，
     *  然后在跳转到自定排序的 url，其中将 sortOrder 设置为 id.current，
     *  因为保证 id.current 都为正数，在官方的代码中会被判定为 ‘ASCENDING’，
     *  但因为 id.current 每次会递增，所以每次我们跳转时，都会重新去获取新的结果，
     *  而不会被缓存。
     */
    const sortOrder = params.sorting?.[0].sortOrder
    let id = getId(true)
    if (orderBy !== 'FRONTEND_ID' || sortOrder === 'DESCENDING') {
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
    tmp.sorting = [{ orderBy, sortOrder: id }]

    /** 判断是页面第一次加载，还是点击排序按钮进行切换
     *
     *  如果是进行切换，并且将自定义排序的参数设置为下一项，
     *  如果是页面第一次加载，则只需要将 id 修改一致即可
     */

    if (isSwitch) {
      if (!tmp.custom?.sort || key !== tmp.custom.sort.orderBy) {
        tmp.custom = {
          ...tmp.custom,
          sort: { sortOrder: 'DESCENDING', orderBy: key },
        }
      } else if (tmp.custom?.sort?.sortOrder === 'DESCENDING') {
        tmp.custom = {
          ...tmp.custom,
          sort: { sortOrder: 'ASCENDING', orderBy: key },
        }
      } else {
        delete tmp.custom.sort
      }
    }

    const url = location.pathname + '?' + serializationPrams(tmp)
    routerTo(url)
  }

  useEffect(() => {
    // 每次 url 地址发生变化的时候，重新解析参数
    const handleUrlchange = () => setParams(parseParams())
    window.addEventListener('urlchange', handleUrlchange)
    return () => {
      window.removeEventListener('urlchange', handleUrlchange)
    }
  }, [])

  return (
    <>
      {SORT_KEY.map(({ key, title }) => {
        let orderBy = params.sorting?.[0].orderBy,
          sortOrder = params.sorting?.[0].sortOrder
        if (params.custom) {
          orderBy = params.custom?.sort?.orderBy
          sortOrder = params.custom?.sort?.sortOrder
        }
        return (
          <Portal container={otherRoots[key]} key={key}>
            <TitleBase
              title={title}
              onSort={
                // 帐号有会员权限，才会获取「出现频率」数据，需要根据帐号状态，决定是否可用
                isPremium || key !== 'FREQUENCY'
                  ? handleCustomSort(key, true)
                  : undefined
              }
              isSort={orderBy === key}
              sortOrder={sortOrder}
              help={
                key === 'FREQUENCY' ? '题目在真实面试的出题频率' : undefined
              }
            />
          </Portal>
        )
      })}

      <div
        css={css`
          padding: 0 8px;
          background-color: ${props =>
            props.theme.mode === 'dark' ? '#303030' : '#f7f8fa'};
        `}
      >
        <TitleBase
          title="Rating"
          onSort={handleCustomSort('RANKING', true)}
          isSort={params.custom?.sort?.orderBy === 'RANKING'}
          sortOrder={params.custom?.sort?.sortOrder}
          showHelpIcon={true}
          help={
            <div style={{ width: 340 }}>
              题目评分数据来自
              <a
                href="https://github.com/zerotrac/leetcode_problem_rating"
                target="_blank"
                rel="noreferrer"
                css={css`
                  color: #1890ff;
                  margin-left: 2px;
                `}
              >
                zerotrac/leetcode_problem_rating
              </a>
            </div>
          }
        />
      </div>
    </>
  )
}

export default RankTitle
