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
} from './rankSlice'
import { RealTimePredict } from './RealTimePredict'
import { User } from './utils'

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
  }, [dispatch, param, hasMyRank])

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

  const showPredictordelta = !!options?.contestRankingPage.ratingPredictor
  const showLanguageIcon = !!options?.contestRankingPage.languageIcon
  const showNewRating = !!options?.contestRankingPage.showNewRating
  const showOldRating = !!options?.contestRankingPage.showOldRating
  const showPredict = !!options?.contestRankingPage.showPredict
  const realTimePredict = !!options?.contestRankingPage.realTimePredict
  const widescreen =
    (showPredict || realTimePredict) &&
    (showPredictordelta || showNewRating || showOldRating)
  console.log(widescreen)
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
                  showHelp={true}
                />
              </th>
            )}
            {realTimePredict && (
              <th
                style={{
                  border: '2px dashed #ddd',
                  borderBottomStyle: 'solid',
                }}
              >
                <Title
                  showOldRating={showOldRating}
                  showPredictordelta={showPredictordelta}
                  showNewRating={showNewRating}
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
