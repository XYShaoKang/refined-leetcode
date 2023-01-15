import store from '@/app/store'
import { findElementByXPath, LeetCodeApi } from '@/utils'
import { selectIsPremium } from '../global/globalSlice'

const getCurrentId = () => {
  const strs = location.pathname.split('/').filter(Boolean)
  if (strs[0] === 'problem-list') return strs[1]
  return ''
}
const api = new LeetCodeApi(location.origin)
let _randomBtn: HTMLDivElement | null = null
const handleRandom = async (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  const id = getCurrentId()
  let questions = await api.getProblemsetQuestionListAll({
    filters: { listId: id },
  })
  const isPremium = selectIsPremium(store.getState())
  if (!isPremium) questions = questions.filter(q => !q.paidOnly)

  const i = Math.floor(Math.random() * (questions.length - 1))
  const url = `/problems/${questions[i].titleSlug}/?favorite=${id}`
  ;(window as any).next?.router.push(url)
}

export async function fixRandom(): Promise<void> {
  if (_randomBtn) _randomBtn.removeEventListener('click', handleRandom)
  _randomBtn = (await findElementByXPath(
    '//*[@id="__next"]/div/div[2]/div/div[2]/div/div[1]/div[2]/div/div[1]',
    el => el?.textContent === '随机开始'
  )) as HTMLDivElement
  if (_randomBtn) _randomBtn.addEventListener('click', handleRandom)
}
