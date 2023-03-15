export type LbaoPredictorType = {
  data_region: string
  username: string
  delta?: number
  oldRating?: number
  newRating?: number
}

export const lbaoPredictorApi = (
  contest_name: string,
  users: { data_region: string; username: string }[]
): Promise<LbaoPredictorType[]> => {
  return fetch('https://lccn.lbao.site/predict_records', {
    method: 'POST',
    body: JSON.stringify({
      contest_name,
      users,
    }),
    headers: { 'content-type': 'application/json' },
  })
    .then(res => res.json())
    .then(
      (
        data: {
          old_rating: number
          new_rating: number
          delta_rating: number
        }[]
      ) =>
        users.map((user, i) => ({
          ...user,
          oldRating: data[i]?.old_rating,
          delta: data[i]?.delta_rating,
          newRating: data[i]?.new_rating,
        }))
    )
}
