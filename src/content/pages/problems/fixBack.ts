import { findElement, routerTo } from '@/utils'
import store from '@/app/store'
import { selectOptions } from '../global/optionsSlice'
const handleBack = (e: MouseEvent) => {
  const favoriteIdHash = new URL(location.href).searchParams.get('favorite')
  const options = selectOptions(store.getState())
  if (favoriteIdHash && options?.problemsPage.fixBackNav) {
    e.stopPropagation()
    e.preventDefault()
    routerTo(`https://leetcode.cn/problem-list/${favoriteIdHash}/`)
  }
}
let _backBtn: null | HTMLDivElement = null
export async function fixBack(): Promise<void> {
  if (_backBtn) {
    _backBtn.removeEventListener('click', handleBack)
    _backBtn = null
  }
  const nav = await findElement(
    '#__next > div > div > div > nav > div > div > div:nth-child(2)'
  )
  _backBtn = nav.children[1] as HTMLDivElement
  _backBtn.addEventListener('click', handleBack)
}
