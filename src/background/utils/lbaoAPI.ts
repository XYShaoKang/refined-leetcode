import { sleep } from '@/utils'

export type LbaoPredictorType = {
  data_region: string
  username: string
  delta?: number
  oldRating?: number
  newRating?: number
}

export const lbaoPredictorApi = async (
  contest_name: string,
  users: { data_region: string; username: string }[],
  retry = 5
): Promise<LbaoPredictorType[]> => {
  const res = await fetch(
    'https://lccn.lbao.site/api/v1/contest-records/predicted-rating',
    {
      method: 'POST',
      body: JSON.stringify({
        contest_name,
        users,
      }),
      headers: { 'content-type': 'application/json' },
    }
  )
  if (retry && res.status === 503) {
    await sleep(2000)
    return lbaoPredictorApi(contest_name, users, retry - 1)
  }
  const data: {
    old_rating: number
    new_rating: number
    delta_rating: number
  }[] = await res.json()
  return users.map((user, i) => ({
    ...user,
    oldRating: data[i]?.old_rating,
    delta: data[i]?.delta_rating,
    newRating: data[i]?.new_rating,
  }))
}
