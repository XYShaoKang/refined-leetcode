import { findElement } from '@/utils'
const handleBack = (e: MouseEvent) => {
  const favoriteIdHash = new URL(location.href).searchParams.get('favorite')
  if (favoriteIdHash) {
    e.stopPropagation()
    e.preventDefault()
    ;(window as any).next.router.push(
      `https://leetcode.cn/problem-list/${favoriteIdHash}/`
    )
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
