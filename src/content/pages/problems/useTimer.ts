import { useEffect, useRef, useState } from 'react'
import { logger } from '../../../utils'

const log = logger.child({ prefix: 'useTimer' })

type Time = [house: number, minute: number, second: number]

function formatTime(time: number): Time {
  time = time / 1000
  const house = Math.floor(time / 3600)
  const minute = Math.floor((time / 60) % 60)
  const second = Math.floor(time % 60)
  return [house, minute, second]
}

type UseTimeReturn = {
  time: Time
  isDone: boolean
  done: (time: Time) => void
  restart: () => void
}

/**
 * 计时器钩子
 * @returns 返回当前累计的时间 `time`;是否已结束 `isDone`;结束当前计时函数 `done`;重新开始函数 `restart`
 */
const useTimer = (): UseTimeReturn => {
  const start = useRef(new Date())
  const [isDone, setIsDone] = useState(false)
  const [time, setTime] = useState(formatTime(0))

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (!isDone) {
      timer = setInterval(async () => {
        setTime(formatTime(new Date().valueOf() - start.current.valueOf()))
      }, 1000)
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [isDone])

  const restart = () => {
    log.debug('重新开始计时')
    setIsDone(false)
    start.current = new Date()
    setTime(formatTime(0))
  }

  const done = (time: Time) => {
    log.debug('结束计时')
    setIsDone(true)
    setTime(time)
  }

  return { time, isDone, done, restart }
}

export { useTimer }
