import { FC, useEffect } from 'react'

import { withRoot } from '@/hoc'
import { useAppDispatch } from '@/hooks'

import FavoriteList from './FavoriteList'
import {
  fetchFavoriteDetails,
  fetchFavoriteMyFavorites,
  fetchFavorites,
} from './favoriteSlice'
import { fetchProblemsetPageProps } from '../global/globalSlice'

const App: FC = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    void (async function () {
      dispatch(fetchProblemsetPageProps())
      const res = await dispatch(fetchFavorites()).unwrap()
      const data = await dispatch(fetchFavoriteMyFavorites()).unwrap()
      const ids = [
        ...new Set(
          res.allFavorites
            .concat(res.officialFavorites)
            .map(({ idHash }) => idHash)
            .concat(data.map(a => a.idHash))
        ),
      ]
      dispatch(fetchFavoriteDetails(ids))
    })()
  }, [])

  return (
    <>
      <FavoriteList category="custom" />
      <FavoriteList category="third" />
      <FavoriteList category="official" />
    </>
  )
}

export default withRoot(App)
