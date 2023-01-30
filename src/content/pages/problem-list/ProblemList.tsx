import { FC, useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks'

import FavoriteList from './FavoriteList'
import {
  fetchFavoriteDetails,
  fetchFavoriteMyFavorites,
  fetchFavorites,
} from './favoriteSlice'
import {
  fetchProblemsetPageProps,
  selectIsSignedIn,
} from '../global/globalSlice'

const App: FC = () => {
  const dispatch = useAppDispatch()
  const isSignedIn = useAppSelector(selectIsSignedIn)
  useEffect(() => {
    void (async function () {
      dispatch(fetchProblemsetPageProps())
      const res = await dispatch(fetchFavorites()).unwrap()
      const data = isSignedIn
        ? await dispatch(fetchFavoriteMyFavorites()).unwrap()
        : []
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
  }, [isSignedIn])

  return (
    <>
      {isSignedIn && <FavoriteList category="custom" />}
      {isSignedIn && <FavoriteList category="third" />}
      <FavoriteList category="official" />
    </>
  )
}

export default App
