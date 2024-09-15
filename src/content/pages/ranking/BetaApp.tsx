import { FC, useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector, useEffectMount } from '@/hooks'

import { selectOptions } from '../global/optionsSlice'
import { Portal } from '@/components/Portal'
import { findElement, findAllElement, findElementByXPath } from '@/utils'
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

export const BetaApp: FC = () => {
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
      // const parent = await findElement('.table-responsive>table>thead>tr')
      // console.log('handleChange')
      const el = await findElementByXPath(
        '//*[@id="__next"]//div[text()="用户名"]',
        el => {
          let p = el
          while (p && p !== document.body) {
            if (p.nextElementSibling?.textContent === '得分') {
              return true
            }
            p = p.parentElement
          }
          return false
        }
      )
      let p: HTMLElement
      if (el) {
        p = el
        while (p && p !== document.body) {
          if (p.nextElementSibling?.textContent === '得分') {
            break
          }
          p = p.parentElement!
        }
        const trs = p.parentElement!.parentElement!
          .children as unknown as HTMLElement[]
        if (state.isMount) {
          setTitleRoot(trs[0])
          // console.log([...trs].slice(1).map(a=>a.children[0]))
          setRows([...trs].slice(1).map(a => a.children[0]) as HTMLElement[])
        }
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
  const showExpectingRanking = !!options?.contestRankingPage.expectingRanking
  const widescreen =
    (showPredict || realTimePredict) &&
    (showPredictordelta || showNewRating || showOldRating)

  useEffectMount(
    async state => {
      if (!widescreen) return
      let p = titleRoot
      while (p && p !== document.body) {
        if (getComputedStyle(p).maxWidth !== 'none') {
          p.style.maxWidth = 'unset'
          p.style.alignItems = 'center'
          break
        }
        p = p.parentElement!
      }
    },
    [widescreen, titleRoot]
  )
  if (!contestInfo || !rows) return null

  return (
    <>
      {(((showPredictordelta || showNewRating || showOldRating) &&
        (showPredict || realTimePredict)) ||
        showExpectingRanking) &&
        titleRoot && (
          <Portal container={titleRoot}>
            <>
              {showPredict && (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    width: 200,
                  }}
                >
                  <Title
                    showOldRating={showOldRating}
                    showPredictordelta={showPredictordelta}
                    showNewRating={showNewRating}
                    showExpectingRanking={showExpectingRanking}
                    realTime={false}
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
                </div>
              )}
              {realTimePredict && (
                <div
                  css={css`
                    &&&& {
                      border: 2px dashed #888;
                      border-bottom-style: solid;
                    }
                  `}
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    width: 300,
                    padding: 8,
                  }}
                >
                  <Title
                    showOldRating={showOldRating}
                    showPredictordelta={showPredictordelta}
                    showNewRating={showNewRating}
                    showExpectingRanking={showExpectingRanking}
                    realTime={true}
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
                </div>
              )}
            </>
          </Portal>
        )}
      {(((showPredictordelta || showNewRating || showOldRating) &&
        (showPredict || realTimePredict)) ||
        showExpectingRanking) &&
        rows && (
          <>
            <Predict
              userInfos={userInfos}
              rows={rows}
              hasMyRank={hasMyRank}
              showOldRating={showOldRating}
              showPredictordelta={showPredictordelta}
              showNewRating={showNewRating}
              showExpectingRanking={showExpectingRanking}
              beta={true}
            />
            {realTimePredict && (
              <RealTimePredict
                rows={rows}
                hasMyRank={hasMyRank}
                showOldRating={showOldRating}
                showPredictordelta={showPredictordelta}
                showNewRating={showNewRating}
                showExpectingRanking={showExpectingRanking}
                beta={true}
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
            beta={true}
          />
        ))}
    </>
  )
}
