import React, { FC, useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import { LeetCodeApi } from '../../leetcode-api'
import { sleep } from '../../leetcode-api/utils'
import { getElement } from '../../utils'

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

function formatTime(time: number) {
  time = time / 1000
  const house = Math.floor(time / 3600)
  const minute = Math.floor((time / 60) % 60)
  const second = Math.floor(time % 60)
  return [house, minute, second]
}

const Clock: FC = () => {
  const pathnames = location.pathname.split('/').filter(Boolean)

  const slug = pathnames[1]
  const [start, setStart] = useState(new Date())
  const [leetCodeApi] = useState(new LeetCodeApi(location.origin))
  const [isDone, setIsDone] = useState(false)
  const [hidden, setHidden] = useState(false)

  const [time, setTime] = useState(formatTime(0))

  const handleRestart = () => {
    console.log(123)
    setStart(new Date())
    setTime(formatTime(0))
    setIsDone(false)
  }

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
    console.log(state)
    if (state.state === 'STARTED') {
      check(submissionId, retry + 1)
    } else if (state.status_msg === 'Accepted') {
      setIsDone(true)
      setHidden(false)
    }
  }

  useEffect(() => {
    let cancal: (() => void) | null = null

    void (async function () {
      const submitBtn = (await getElement('.submit__-6u9'))[0]
      const handleClick: EventListenerOrEventListenerObject = async () => {
        getsubmissionId()
      }
      submitBtn.addEventListener('click', handleClick)
      cancal = () => {
        submitBtn.removeEventListener('click', handleClick)
      }
    })()
    return () => {
      if (cancal) cancal()
    }
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (!isDone) {
      timer = setInterval(async () => {
        setTime(formatTime(new Date().valueOf() - start.valueOf()))
      }, 1000)
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [isDone])

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
        <Button onClick={handleRestart}>重新开始</Button>
      )}
    </Container>
  )
}

export default Clock
