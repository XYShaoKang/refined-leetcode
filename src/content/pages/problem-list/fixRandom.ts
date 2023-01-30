import store from '@/app/store'
import { findElementByXPath, LeetCodeApi, routerTo } from '@/utils'

import { selectIsPremium } from '../global/globalSlice'
import { selectOptions } from '../global/optionsSlice'

const getCurrentId = () => {
  const strs = location.pathname.split('/').filter(Boolean)
  if (strs[0] === 'problem-list') return strs[1]
  return ''
}
const api = new LeetCodeApi(location.origin)
const handleRandom = async (e: MouseEvent) => {
  const options = selectOptions(store.getState())
  if (options?.problemListPage.fixRandomQuestion) {
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
    routerTo(url)
  }
}
const randomXpath =
  '//*[@id="__next"]/div/div[2]/div/div[2]/div/*//span[text()="随机开始"]'

export const fixRandom = async (): Promise<void> => {
  const spans = await findElementByXPath({
    xpath: randomXpath,
    nodeType: 'UNORDERED_NODE_ITERATOR_TYPE',
  })
  for (const el of spans) {
    el.parentElement?.removeEventListener('click', handleRandom) // 如果存在旧的监听器，先删除掉
    el.parentElement?.addEventListener('click', handleRandom)
  }
}
