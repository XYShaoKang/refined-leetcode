import { FC, useEffect } from 'react'

import { withRoot } from '@/hoc'
import { useAppDispatch } from '@/hooks'

import FavoriteList from './FavoriteList'
import { fetchFavorites } from './favoriteSlice'
import { fetchProblemsetPageProps } from '../global/globalSlice'

const App: FC = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(fetchProblemsetPageProps())
    dispatch(fetchFavorites())
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
