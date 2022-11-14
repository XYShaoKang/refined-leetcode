import { useEffect } from 'react'

import { selectAllPosts, fetchPosts } from './postsSlice'
import { selectAllBlockUsers } from './blockUsersSlice'
import { useAppDispatch, useAppSelector } from '../hooks'

export const useBlock = (): void => {
  const posts = useAppSelector(selectAllPosts)
  const users = useAppSelector(selectAllBlockUsers)
  const dispatch = useAppDispatch()
  useEffect(() => {
    const blockUsers = new Set(
        users.filter(user => user.block).map(user => user.slug)
      ),
      tempUnBlockUsers = new Set(
        users.filter(user => !user.block).map(user => user.slug)
      )

    const blockPosts = new Set<string>(),
      tmpUnBlockPosts = new Set<string>()

    for (const post of posts) {
      const userSlug = post.feedContent.author.userSlug
      if (blockUsers.has(userSlug)) {
        blockPosts.add(post.meta.link)
      } else if (tempUnBlockUsers.has(userSlug)) {
        tmpUnBlockPosts.add(post.meta.link)
      }
    }

    const postEls = document.querySelectorAll(
      '.css-1tc14ag-card-layer1-card-MainContentConainer>.css-1pej3s6-FeedContainer>div:nth-of-type(1)>a:nth-of-type(1)'
    )

    Array.prototype.forEach.call(postEls, (el: HTMLAnchorElement) => {
      const p = el.parentElement?.parentElement
      if (p) {
        if (blockPosts.has(el.pathname)) {
          // 处于黑名单中的元素
          p.classList.add('refined-leetcode-block')
          p.classList.remove('refined-leetcode-temp')
        } else if (tmpUnBlockPosts.has(el.pathname)) {
          // 处于临时解锁中的元素
          p.classList.add('refined-leetcode-block')
          p.classList.add('refined-leetcode-temp')
        } else if (p.classList.contains('refined-leetcode-block')) {
          // 不处于黑名单中的元素
          p.classList.remove('refined-leetcode-block', 'refined-leetcode-temp')
        }
      }
    })
  }, [posts, users])

  useEffect(() => {
    dispatch(fetchPosts(30))

    const handleFetchPost = async () => {
      await dispatch(fetchPosts(10)).unwrap()
    }

    const handleClick = (e: Event) => {
      const el = e.target
      const cls = 'css-1csfdb4-BaseButtonComponent-LoadMoreButton'
      if (
        el instanceof HTMLElement &&
        (el.classList.contains(cls) ||
          el.parentElement?.classList.contains(cls))
      ) {
        handleFetchPost()
      }
    }
    const root = document.querySelector('.css-185cq5e-LeftContainer')
    if (root) {
      root.addEventListener('click', handleClick)
    }
    return () => {
      if (root) {
        root.removeEventListener('click', handleClick)
      }
    }
  }, [])
}
