import { findElementByXPath, LeetCodeApi } from '@/utils'

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
  const questions = await api.getProblemsetQuestionList(id)

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
