import React, { FC, useEffect, useState } from 'react'
import styled, { css } from 'styled-components/macro'

import {
  sleep,
  LeetCodeApi,
  SuccessCheckReturnType,
  findElement,
  findElementByXPath,
  findAllElement,
} from '@/utils'
import { useEvent, useHover, useObserverAncestor } from '@/hooks'
import { ToolTip } from '@/components/ToolTip'

import {
  submissionOnMarkChange,
  checkIfSubmitKey,
  checkIfGlobalSubmitIsDisabled,
  getRoot,
} from './utils'
import { useTimer } from './useTimer'
import { logger } from '../../../utils'
import { Portal } from '@/components/Portal'
import ResetIcon from '@/components/icons/ResetIcon'

const log = logger.child({ prefix: 'Clock' })

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
`

const Content = styled.div<{ beta: boolean }>`
  height: ${props => (props.beta ? 33 : 35)}px;
  border-radius: 3px 0 0 3px;
  border: 1px solid palevioletred;
  border-right-width: 0;
  display: flex;
  align-items: center;
  padding: 0 15px;
  white-space: nowrap;
`

const Button = styled.button<{
  primary?: boolean
  width: number
  center: boolean
  height: number
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;

  color: palevioletred;
  text-align: center;
  cursor: pointer;
  border: 1px solid palevioletred;
  border-radius: 0;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  ${({ center }) =>
    center
      ? css`
          border-right: 0;
          margin-right: 0;
          padding: 0;
          line-height: 16px;
        `
      : css`
          border-radius: 0 3px 3px 0;
          padding: 0px 15px;
        `}
`

interface TimerProps {
  beta?: boolean
  root?: HTMLElement
  dynamicLayout?: boolean
}

const Timer: FC<TimerProps> = ({ beta, root, dynamicLayout }) => {
  const pathnames = location.pathname.split('/').filter(Boolean)
  const slug = pathnames[1]

  const [leetCodeApi] = useState(new LeetCodeApi(location.origin))
  const [hidden, setHidden] = useState(false)
  const [editEl, setEditEl] = useState<HTMLElement>()

  const { time, isDone, done, restart } = useTimer()

  useEffect(() => restart(), [slug])

  const [hoverRef, hover] = useHover<HTMLDivElement>()

  const handleHidden = () => {
    setHidden(hidden => !hidden)
  }

  /** 获取 SubmissionId
   *
   * 从提交请求的返回值中获取 SubmissionId
   * @returns 返回 SubmissionId
   */
  async function getSubmissionIdByXML(): Promise<string> {
    return new Promise(function (resolve, reject) {
      const originalOpen = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function newOpen(
        this: XMLHttpRequest,
        method: string,
        url: string,
        async?: boolean,
        user?: string,
        password?: string
      ) {
        log.debug('open: %s %s', method, url)
        if (
          method.toLocaleLowerCase() === 'post' &&
          url === `/problems/${slug}/submit/`
        ) {
          log.debug('拦截发送请求 %s %s', method, url)
          this.addEventListener('readystatechange', function (event) {
            log.debug('readystatechange %o %d', event, this.readyState)
            const DONE = XMLHttpRequest.DONE ?? 4
            if (this.readyState === DONE) {
              log.debug('readystatechange done')
              const status = this.status
              if (status === 0 || (status >= 200 && status < 400)) {
                log.debug('readystatechange state %s', this.responseText)
                const data = JSON.parse(this.responseText)
                log.debug('还原 open')
                if (XMLHttpRequest.prototype.open === newOpen) {
                  XMLHttpRequest.prototype.open = originalOpen
                }

                resolve(data.submission_id + '')
              } else {
                if (status === 429) {
                  log.debug(`状态 429,等待重试`)
                } else {
                  if (XMLHttpRequest.prototype.open === newOpen) {
                    XMLHttpRequest.prototype.open = originalOpen
                  }
                  log.error(`获取 SubmissionId 失败`)
                  reject(`提交错误,状态 ${status}`)
                }
              }
            }
          })
        }
        originalOpen.apply(this, [method, url, async!, user, password])
      }
    })
  }
  /** 获取 SubmissionId
   *
   * 从提交请求的返回值中获取 SubmissionId
   * @returns 返回 SubmissionId
   */
  async function getSubmissionIdByFetch(): Promise<{
    submissionId: string
    statusMsg: string
  }> {
    const originalFetch = window.fetch
    const res: { submissionId: string; statusMsg: string } = {
      submissionId: '',
      statusMsg: '',
    }
    return new Promise(function (resolve) {
      window.fetch = async function fetch(...args) {
        const [url, request] = args
        if (url === `/problems/${slug}/submit/` && request?.method === 'POST') {
          // 获取 submissionId
          const response = await originalFetch(...args)
          const tmp = response.clone()
          const { submission_id } = await tmp.json()
          res.submissionId = submission_id
          return response
        } else if (
          res.submissionId &&
          url === `/submissions/detail/${res.submissionId}/check/`
        ) {
          // 获取当前提交的结果
          const response = await originalFetch(...args)
          const tmp = response.clone()
          const { state, status_msg } = await tmp.json()
          if (state === 'SUCCESS') {
            res.statusMsg = status_msg
            window.fetch = originalFetch
            resolve(res)
          }
          return response
        }
        return originalFetch(...args)
      }
    })
  }

  /** 检查提交是否通过
   *
   * @param submissionId 提交的 Id
   * @param maxRetry 最多重试次数
   * @param count 当前已经重试的次数
   * @returns
   */
  async function check(
    submissionId: string,
    maxRetry = 10,
    count = 1
  ): Promise<SuccessCheckReturnType> {
    if (count > maxRetry) throw new Error('获取提交状态结果超时')

    await sleep(1000 + count * 500)
    const state = await leetCodeApi.check(submissionId)

    if (state.state === 'SUCCESS') {
      return state
    } else {
      return await check(submissionId, count + 1)
    }
  }

  /** 提交成功时的处理函数
   */
  const submitSuccess = useEvent(async submissionId => {
    log.debug('提交成功')
    // 提交成功
    done(time)

    setHidden(false)

    await leetCodeApi.submissionCreateOrUpdateSubmissionComment(
      submissionId,
      'RED',
      time.map(t => t.toString().padStart(2, '0')).join(' : ')
    )

    log.debug('已添加备注')
    if (!beta || localStorage.getItem('dynamicLayoutGuide') === 'true') {
      // 新版 UI 会自动刷新备注,所以不需要再手动刷新了
      // 对当前提交添加备注
      await sleep(500)
      await submissionOnMarkChange(submissionId)
      log.debug('刷新备注')
    }
  })

  /** 提交事件
   */
  const handleClick = useEvent(async () => {
    log.debug('提交开始')
    if (beta) {
      const { submissionId, statusMsg } = await getSubmissionIdByFetch()
      if (statusMsg === 'Accepted') {
        submitSuccess(submissionId)
      }
    } else {
      const submissionId = await getSubmissionIdByXML()
      log.debug('获取 submissionId %s', submissionId)
      const state = await check(submissionId)
      log.debug('获取提交状态 %s', state.status_msg)

      if (state.status_msg === 'Accepted') {
        submitSuccess(submissionId)
      }
    }
  })

  const getSubMitBtn = async () => {
    let submitBtn: HTMLElement
    if (dynamicLayout) {
      const xpath = "//span[text()='提交']"
      submitBtn = await findElementByXPath(xpath)
      submitBtn = submitBtn.parentElement!
    } else if (beta) {
      const parent = await getRoot()
      if (parent) {
        submitBtn = [...parent.children].slice(-1)[0] as HTMLElement
      } else {
        throw new Error('未找到提交按钮')
      }
    } else {
      submitBtn = await findElement('.submit__-6u9')
    }
    return submitBtn
  }

  // TODO: 使用 useEffectMount 重构
  useEffect(() => {
    if (!root) return
    log.info('加载 Clock 组件')
    const cancel: { current: (() => void) | null | 'unmount' } = {
      current: null,
    }

    void (async function () {
      // 当前组件已经被卸载,就不需要挂载事件
      let submitBtn: HTMLElement = await getSubMitBtn()

      const mount = async () => {
        submitBtn = await getSubMitBtn()
        if (cancel.current === 'unmount') return
        log.debug('挂载按钮')

        submitBtn.addEventListener('click', handleClick)
      }

      const unmount = async () => {
        log.debug('卸载按钮')
        submitBtn.removeEventListener('click', handleClick)
      }

      const observer = new MutationObserver(function (
        mutationsList,
        _observer
      ) {
        let isRemove = false,
          isAdd = false
        const check = (nodes: NodeList) =>
          Array.from(nodes).some(
            node => (node as HTMLElement).innerText === '提交'
          )

        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            if (check(mutation.removedNodes)) isRemove = true
            if (check(mutation.addedNodes)) isAdd = true
          }
        }
        if (isRemove) {
          // 删除提交按钮
          log.debug('提交按钮被删除,卸载监听提交事件')
          unmount()
        } else if (isAdd) {
          // 添加提交按钮
          log.debug('提交按钮被添加,挂载监听提交事件')
          mount()
        }
      })

      if (cancel.current === 'unmount') return

      mount()
      observer.observe(submitBtn.parentElement!, { childList: true })

      cancel.current = () => {
        unmount()
        observer.disconnect()
      }
    })()

    return () => {
      logger.info('卸载 Clock 组件')
      if (typeof cancel.current === 'function') {
        cancel.current()
      } else {
        cancel.current = 'unmount'
      }
    }
  }, [root])

  //#region 快捷键提交
  /** 使用快捷键提交的事件
   */
  const handleKeydown = async (e: KeyboardEvent) => {
    if (!checkIfSubmitKey(e)) return
    const globalSubmitIsDisabled = await checkIfGlobalSubmitIsDisabled()
    if (globalSubmitIsDisabled) return
    log.debug('使用快捷键提交')
    handleClick()
  }

  const getEditEl = async () => {
    let editEl: HTMLElement

    if (beta) {
      const editEls = await findAllElement(
        '.monaco-editor',
        els =>
          !!els.find(el => el.parentElement?.dataset.modeId !== 'plaintext')
      )
      editEl = editEls.find(
        el => el.parentElement?.dataset.modeId !== 'plaintext'
      )!
    } else {
      editEl = await findElement('.euyvu2f0')
    }
    return editEl
  }
  useObserverAncestor(async state => {
    const editEl: HTMLElement = await getEditEl()
    if (!state.isMount) return
    setEditEl(editEl)
    return editEl
  })
  useEffect(() => {
    if (!editEl) return
    console.log(editEl)
    editEl.addEventListener('keydown', handleKeydown)
    return () => editEl.removeEventListener('keydown', handleKeydown)
  }, [editEl])
  //#endregion

  if (!root) return null

  return (
    <Portal container={root}>
      <Container>
        {!hidden && (
          <Content beta={!!beta}>
            {`${isDone ? '本次耗时: ' : ''}${time
              .map(t => t.toString().padStart(2, '0'))
              .join(' : ')}`}
          </Content>
        )}
        {!isDone ? (
          <div
            ref={hoverRef}
            style={{ display: 'flex', height: beta ? 33 : 35 }}
          >
            {!hidden && hover && (
              <ToolTip
                title="点击重置按钮,可重置计时"
                placement={dynamicLayout ? 'bottom' : 'top'}
              >
                <div
                  style={{
                    border: '1px solid palevioletred',
                    borderRight: 0,
                    height: '100%',
                    width: 20,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ResetIcon onClick={restart} width={19} height={19} />
                </div>
              </ToolTip>
            )}
            <ToolTip
              title={!hidden ? '点击隐藏实时计时' : '点击显示实时计时'}
              placement={dynamicLayout ? 'bottom' : 'top'}
            >
              <Button
                onClick={handleHidden}
                center={false}
                width={!hidden && hover ? 80 : 100}
                height={beta ? 33 : 35}
                style={
                  hidden
                    ? { borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }
                    : {}
                }
              >
                {hidden ? '显示计时' : '隐藏'}
              </Button>
            </ToolTip>
          </div>
        ) : (
          <Button
            onClick={restart}
            center={false}
            width={100}
            height={beta ? 33 : 35}
          >
            重新开始
          </Button>
        )}
      </Container>
    </Portal>
  )
}

export default Timer
