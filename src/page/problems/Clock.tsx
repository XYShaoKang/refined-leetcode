import React, { FC, useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import { LeetCodeApi } from '../../leetcode-api'
import { sleep } from '../../leetcode-api/utils'
import { getElement, submissionOnMarkChange } from '../../utils'
import { useTimer } from './useTimer'

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

  async function getsubmissionId(retry = 1) {
    if (retry > 10) return
    const { submissions } = await leetCodeApi.getSubmissions(slug)
    const pendingSubmission = submissions.find(
      ({ isPending }) => isPending === 'Pending'
    )
    if (!pendingSubmission) {
      getsubmissionId(retry + 1)
    } else {
      check(pendingSubmission.id)
      sleep(200)
    }
  }

  async function check(submissionId: string, retry = 1) {
    if (retry > 10) {
      return
    }
    sleep(500)
    const state = await leetCodeApi.check(submissionId)

    if (state.state === 'STARTED') {
      check(submissionId, retry + 1)
    } else if (state.status_msg === 'Accepted') {
      // 成功提交
      done(async time => {
        // 对当前提交添加备注
        await leetCodeApi.submissionCreateOrUpdateSubmissionComment(
          submissionId,
          'RED',
          time.map(t => t.toString().padStart(2, '0')).join(' : ')
        )

        submissionOnMarkChange(submissionId)
      })

      setHidden(false)
    }
  }

  useEffect(() => {
    let cancel: (() => void) | null = null

    void (async function () {
      const submitBtn = (await getElement('.submit__-6u9'))[0]
      const handleClick: EventListenerOrEventListenerObject = async () => {
        getsubmissionId()
      }
      submitBtn.addEventListener('click', handleClick)
      cancel = () => {
        submitBtn.removeEventListener('click', handleClick)
      }
    })()
    return () => {
      if (cancel) cancel()
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
