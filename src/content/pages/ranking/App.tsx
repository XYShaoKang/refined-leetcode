import { FC, useEffect, useState } from 'react'

import { withPage } from '@/hoc'
import { useAppDispatch, useAppSelector, useEffectMount } from '@/hooks'

import { selectOptions } from '../global/optionsSlice'
import { Portal } from '@/components/Portal'
import { findElement, findAllElement } from '@/utils'
import Predict from './Predict'
import { useUrlChange } from './Item'
import Title from './Title'
import { LanguageIconRow } from './LanguageIcon'
import { debounce } from 'src/utils'
import {
  fetchContestRanking,
  fetchContestInfo,
  selectContestInfo,
  fetchMyRank,
  selectPreviousRatingUpdateTime,
} from './rankSlice'
import { RealTimePredict } from './RealTimePredict'
import { User } from './utils'
import { format } from 'date-fns'
import { css } from 'styled-components/macro'

const App: FC = () => {
  const options = useAppSelector(selectOptions)
  const [titleRoot, setTitleRoot] = useState<HTMLElement>()
  const [rows, setRows] = useState<HTMLElement[]>()
  const [param] = useUrlChange()
  const dispatch = useAppDispatch()
  const hasMyRank = rows?.[0]?.className === 'success' ? true : false
  const [userInfos, setUserInfos] = useState<User[]>([])

  useEffect(() => {
    void (async () => {
      if (!rows?.length) return
      const res = await dispatch(
        fetchContestRanking({
          contestSlug: param.contestId,
          page: param.page,
          region: param.region,
        })
      ).unwrap()
      const userInfos = res.total_rank.map(a => ({
        region: a.data_region,
        username: a.username,
      }))
      if (hasMyRank) {
        userInfos.unshift({
          region: 'CN',
          username: (window as any).LeetCodeData.userStatus.username,
        })
      }
      setUserInfos(userInfos)
    })()
  }, [dispatch, param, hasMyRank, rows])

  useEffect(() => {
    dispatch(fetchContestInfo(param.contestId))
  }, [dispatch, param.contestId])

  useEffectMount(async state => {
    const handleChange = debounce(async () => {
      const parent = await findElement('.table-responsive>table>thead>tr')
      const trs = await findAllElement(
        '.table-responsive>table>tbody>tr',
        els =>
          !!els.length &&
          (els[0]?.className === 'success' ? els.length > 1 : true)
      )
      if (state.isMount) {
        setTitleRoot(parent)
        setRows([...trs])
      }
    }, 100)
    handleChange()

    window.addEventListener('urlchange', handleChange)
  }, [])

  useEffect(() => {
    if (hasMyRank) {
      dispatch(fetchMyRank(param.contestId))
    }
  }, [dispatch, hasMyRank, param])

  const contestInfo = useAppSelector(state =>
    selectContestInfo(state, param.contestId)
  )
  const updateTime = useAppSelector(state =>
    selectPreviousRatingUpdateTime(state, param.contestId)
  )

  const showPredictordelta = !!options?.contestRankingPage.ratingPredictor
  const showLanguageIcon = !!options?.contestRankingPage.languageIcon
  const showNewRating = !!options?.contestRankingPage.showNewRating
  const showOldRating = !!options?.contestRankingPage.showOldRating
  const showPredict = !!options?.contestRankingPage.showPredict
  const realTimePredict = !!options?.contestRankingPage.realTimePredict
  const widescreen =
    (showPredict || realTimePredict) &&
    (showPredictordelta || showNewRating || showOldRating)

  useEffectMount(
    async state => {
      if (!widescreen) return

      const container = await findElement('#contest-app .container')
      if (!state.isMount) return
      container.style.width = '98%'
      container.style.maxWidth = '1440px'
      state.unmount.push(() => {
        container.style.width = ''
        container.style.maxWidth = ''
      })
    },
    [widescreen]
  )

  if (!contestInfo || !rows) return null
  console.log(updateTime)
  return (
    <>
      {(showPredictordelta || showNewRating || showOldRating) &&
        (showPredict || realTimePredict) &&
        titleRoot && (
          <Portal container={titleRoot}>
            {showPredict && (
              <th>
                <Title
                  showOldRating={showOldRating}
                  showPredictordelta={showPredictordelta}
                  showNewRating={showNewRating}
                  help={
                    <>
                      预测数据来自
                      <a
                        href="https://lccn.lbao.site/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ paddingLeft: 2 }}
                      >
                        lccn.lbao.site
                      </a>
                    </>
                  }
                />
              </th>
            )}
            {realTimePredict && (
              <th
                css={css`
                  &&&& {
                    border: 2px dashed #ddd;
                    border-bottom-style: solid;
                  }
                  &&::before {
                    content: '实时预测';
                    position: fixed;
                    transform: translate(-10%, -110%);
                    background: #fafafa;
                    padding: 0 5px;
                    font-size: 12px;
                    color: #999;
                  }
                `}
              >
                <Title
                  showOldRating={showOldRating}
                  showPredictordelta={showPredictordelta}
                  showNewRating={showNewRating}
                  help={
                    <div>
                      实时预测，仅供参考，详细说明查看帖子
                      <a
                        href="https://leetcode.cn/circle/discuss/0OHPDu/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        实时预测功能
                      </a>
                      <br />
                      {updateTime
                        ? `当前数据更新时间为：「${format(
                            new Date(updateTime),
                            'yyyy-MM-dd HH:mm'
                          )}」`
                        : ''}
                    </div>
                  }
                />
              </th>
            )}
          </Portal>
        )}
      {(showPredictordelta || showNewRating || showOldRating) &&
        (showPredict || realTimePredict) &&
        rows && (
          <>
            <Predict
              userInfos={userInfos}
              rows={rows}
              hasMyRank={hasMyRank}
              showOldRating={showOldRating}
              showPredictordelta={showPredictordelta}
              showNewRating={showNewRating}
            />
            {realTimePredict && (
              <RealTimePredict
                rows={rows}
                hasMyRank={hasMyRank}
                showOldRating={showOldRating}
                showPredictordelta={showPredictordelta}
                showNewRating={showNewRating}
              />
            )}
          </>
        )}
      {showLanguageIcon &&
        rows?.map((row, i) => (
          <LanguageIconRow
            contestSlug={param.contestId}
            key={i}
            row={row}
            i={i}
            hasMyRank={hasMyRank}
          />
        ))}
    </>
  )
}

export default withPage('contestRankingPage')(App)
