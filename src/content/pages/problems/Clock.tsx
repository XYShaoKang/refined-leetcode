import React, { FC, useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import { LeetCodeApi, SuccessCheckReturnType } from './leetcode-api'
import { sleep, submissionOnMarkChange } from './utils'
import { findElement } from '../../utils'
import { useTimer } from './useTimer'
import { logger } from '../../../utils'

const log = logger.child({ prefix: 'Clock' })

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
`

const Content = styled.div`
  border-radius: 3px 0 0 3px;
  border: 1px solid palevioletred;
  border-right-width: 0;
  margin-left: 15px;
  padding: 6px 15px;
`

const Button = styled.button<{ primary?: boolean }>`
  background: transparent;
  border-radius: 0 3px 3px 0;
  border: 1px solid palevioletred;
  color: palevioletred;
  margin-right: 15px;
  padding: 6px 15px;
  width: 100px;
  text-align: center;
  cursor: pointer;
`

const Clock: FC = () => {
  const pathnames = location.pathname.split('/').filter(Boolean)
  const slug = pathnames[1]

  const [leetCodeApi] = useState(new LeetCodeApi(location.origin))
  const [hidden, setHidden] = useState(false)

  const { time, isDone, done, restart } = useTimer()

  const handleHidden = () => {
    setHidden(hidden => !hidden)
  }

  async function getSubmissionId(): Promise<string> {
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

  async function check(
    submissionId: string,
    retry = 1
  ): Promise<SuccessCheckReturnType> {
    if (retry > 10) throw new Error('获取提交状态结果超时')

    await sleep(1000 + retry * 500)
    const state = await leetCodeApi.check(submissionId)

    if (state.state === 'SUCCESS') {
      return state
    } else {
      return await check(submissionId, retry + 1)
    }
  }

  useEffect(() => {
    log.info('加载 Clock 组件')
    const cancel: { current: (() => void) | null | 'unmount' } = {
      current: null,
    }

    void (async function () {
      const submitBtn = await findElement('.submit__-6u9')
      const editEl = await findElement('.euyvu2f0')

      const handleClick = async () => {
        log.debug('提交开始')
        const submissionId = await getSubmissionId()
        log.debug('获取 submissionId %s', submissionId)
        const state = await check(submissionId)
        log.debug('获取提交状态 %s', state.status_msg)

        if (state.status_msg === 'Accepted') {
          // 提交成功
          done(async time => {
            // 对当前提交添加备注
            await leetCodeApi.submissionCreateOrUpdateSubmissionComment(
              submissionId,
              'RED',
              time.map(t => t.toString().padStart(2, '0')).join(' : ')
            )

            log.debug('已添加备注')

            submissionOnMarkChange(submissionId)
            log.debug('刷新备注')
          })

          setHidden(false)
        }
      }

      const isMac = () => {
        return (
          navigator.platform.indexOf('Mac') === 0 ||
          navigator.platform === 'iPhone'
        )
      }
      const isSubmit = (e: KeyboardEvent) => {
        // 检查全局提交快捷键是否开启
        const globalDisabledSubmitCode = localStorage.getItem(
          'global_disabled_submit_code'
        )

        if (globalDisabledSubmitCode === 'false') return false

        let mate = false

        // 检查是否按下对应的快捷键,如果是 Mac 电脑为 mate 键,Window 或 Linux 为 Ctrl 键
        if (isMac()) {
          if (e.metaKey === true && e.ctrlKey === false) mate = true
        } else {
          if (e.ctrlKey === true) mate = true
        }

        if (
          mate &&
          e.code === 'Enter' &&
          e.altKey === false &&
          e.shiftKey === false
        ) {
          return true
        }

        return false
      }
      const keydownHandle = (e: KeyboardEvent) => {
        if (isSubmit(e)) {
          log.debug('使用快捷键提交')
          handleClick()
        }
      }

      if (cancel.current === 'unmount') return // 当前组件已经被卸载,就不需要挂载事件

      submitBtn.addEventListener('click', handleClick)
      editEl.addEventListener('keydown', keydownHandle, { capture: true })

      cancel.current = () => {
        submitBtn.removeEventListener('click', handleClick)
        editEl.removeEventListener('keydown', keydownHandle, { capture: true })
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
  }, [])

  return (
    <Container>
      {!hidden && (
        <Content>
          {`${isDone ? '本次耗时: ' : ''}${time
            .map(t => t.toString().padStart(2, '0'))
            .join(' : ')}`}
        </Content>
      )}
      {!isDone ? (
        <Button
          onClick={handleHidden}
          style={
            hidden ? { borderTopLeftRadius: 3, borderBottomLeftRadius: 3 } : {}
          }
        >
          {hidden ? '显示计时' : '隐藏'}
        </Button>
      ) : (
        <Button onClick={restart}>重新开始</Button>
      )}
    </Container>
  )
}

export default Clock
