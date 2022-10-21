import React, {
  FC,
  useState,
  ChangeEventHandler,
  KeyboardEventHandler,
  useEffect,
  useContext,
} from 'react'
import styled, { ThemeContext } from 'styled-components/macro'

import { Placement, Popper } from '../components/Popper'

interface BlockUserListProps {
  placement?: Placement
  anchorEl?: HTMLElement | null
}

const List = styled.ul`
  padding: 0;
  margin: 0;
`

const Item = styled.li`
  list-style: none;
  line-height: 1.42857;
  box-sizing: border-box;
  height: 30px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  font-size: 14px;
  border-radius: 5px;
  padding: 0px 12px;
  font-weight: 400;
  transition: all 0.2s ease 0s;
  cursor: pointer;
  color: ${props => props.theme.palette.text.main};
  &:hover {
    background-color: ${props => props.theme.palette.secondary.hover};
  }
`

const Input = styled.input`
  overflow: visible;
  height: 32px;
  outline: none;
  border-radius: 8px !important;
  box-sizing: border-box;
  margin: 0 10px 0 0;
  width: 100%;
  padding: 4px 11px;
  font-size: 14px;
  line-height: 1.5715;
  border: 1px solid rgba(0, 0, 0, 0);
  transition: all 0.3s;
  touch-action: manipulation;
  text-overflow: ellipsis;
  color: ${props => props.theme.palette.text.main};
  background: ${props => props.theme.palette.secondary.main};
  &:focus {
    background-color: ${props => props.theme.palette.secondary.hover};
  }
`

const Add = styled.button`
  color-scheme: dark;
  font-feature-settings: 'tnum';
  box-sizing: border-box;
  margin: 0;
  border: none;
  line-height: 20px;
  outline: none;
  user-select: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition-property: color, box-shadow, background-color, opacity;
  transition-duration: 0.3s;
  overflow: hidden;
  cursor: pointer;
  opacity: 1;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 8px;
  color: ${props => props.theme.palette.button.text};
  background-color: ${props => props.theme.palette.button.main};
  &:hover {
    background-color: ${props => props.theme.palette.button.hover};
  }
`

const Clear = styled.div`
  border-radius: 50%;
  height: 24px;
  width: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: ${props => props.theme.palette.secondary.main};
  }
  & > svg {
    height: 16px;
    width: 16px;
    fill: currentcolor;
  }
`

type UserInfo = {
  slug: string
  name: string
}

/**
 * 获取 LocalStorage 中对应 key 的数据
 * @param key 需要获取数据的 key
 * @param init 如果当前数据不存在,或者无效,用于初始化的值或者函数
 * @param json 是否自动进行 JSON 解析
 */
function useLocalStorage<T extends {} | [] | string = string>(
  ...[key, init, json]: T extends string
    ? [key: string, init: T | (() => T), json?: false]
    : [key: string, init: T | (() => T), json: true]
) {
  const [data, setData] = useState<T>(() => {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const res = json ? JSON.parse(data) : data
        if (res) return res
      } catch (error) {
        //
      }
    }

    // 当前不存在有效数据,或者解析失败,则使用初始化的数据
    if (typeof init === 'function') {
      return init()
    }
    return init
  })
  useEffect(() => {
    // 当 LocalStorage 中的数据发生变化时,同步当前数据
    // storage 事件对于同一个标签无效,只能作用与其他标签
    // @see https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        const data = e.newValue
        if (data) {
          try {
            const res = json ? JSON.parse(data) : data
            setData(res)
          } catch (error) {
            //
          }
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const setValue = (fn: T | ((data: T) => T)) => {
    let res: T
    if (typeof fn === 'function') {
      res = fn(data)
    } else {
      res = fn
    }
    setData(res)
    localStorage.setItem(key, json ? JSON.stringify(res) : (res as string))
  }
  return [data, setValue] as const
}

/**
 * 获取用户信息
 * @param slug 用户 slug
 */
function getUserInfo(slug: string) {
  return fetch('https://leetcode.cn/graphql/', {
    headers: {
      'content-type': 'application/json',
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: JSON.stringify({
      query: /* GraphQL */ `
        query userProfilePublicProfile($userSlug: String!) {
          userProfilePublicProfile(userSlug: $userSlug) {
            haveFollowed
            siteRanking
            profile {
              userSlug
              realName
              aboutMe
              asciiCode
              userAvatar
              gender
              websites
              skillTags
              globalLocation {
                country
                province
                city
              }
              socialAccounts {
                provider
                profileUrl
              }
              skillSet {
                langLevels {
                  langName
                  langVerboseName
                  level
                }
                topics {
                  slug
                  name
                  translatedName
                }
                topicAreaScores {
                  score
                  topicArea {
                    name
                    slug
                  }
                }
              }
            }
            educationRecordList {
              unverifiedOrganizationName
            }
            occupationRecordList {
              unverifiedOrganizationName
              jobTitle
            }
          }
        }
      `,
      variables: { userSlug: slug },
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  }).then(res => res.json())
}

const BlockUserList: FC<BlockUserListProps> = props => {
  const [slug, setData] = useState<string>('')
  const [list, setList] = useLocalStorage<UserInfo[]>('BlockUserList', [], true)

  let width = 0
  if (props.anchorEl) {
    width = props.anchorEl.getClientRects()[0].width
  }
  const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
    setData(e.target.value)
  }
  /**
   * 添加用户
   * 1. 查找是否已存在对应的用户,如果已存在则不用重复添加
   * 2. 检查 slug 是否有效
   * 3. 将 {slug,name} 存到 LocalStorage 中
   */
  const handleAdd = async () => {
    if (list.find(item => item.slug === slug)) {
      console.error('已存在相同用户')
      return
    }
    const res = await getUserInfo(slug)
    if (!res?.data?.userProfilePublicProfile) {
      console.error('无效的 slug')
      return
    }

    setList(list => [
      ...(list ?? []),
      { slug: slug, name: res.data.userProfilePublicProfile.profile.realName },
    ])
    setData('')
  }

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }
  const handleDelete = (slug: string) => {
    setList(list => (list ?? []).filter(item => item.slug !== slug))
  }
  const themeContext = useContext(ThemeContext)

  return (
    <Popper
      {...props}
      style={{
        width,
        borderRadius: 8,
        background: themeContext.palette.primary.light,
      }}
      as="div"
    >
      <div style={{ display: 'flex' }}>
        <Input
          type="text"
          value={slug}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <Add style={{ flexShrink: 0 }} onClick={handleAdd}>
          添加
        </Add>
      </div>
      <List style={{ marginTop: list.length ? 10 : 0 }}>
        {list.map(({ slug, name }) => (
          <Item key={slug}>
            <div>{name}</div>
            <Clear onClick={() => handleDelete(slug)}>
              <svg viewBox="0 0 24 24">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </Clear>
          </Item>
        ))}
      </List>
    </Popper>
  )
}

export default BlockUserList
