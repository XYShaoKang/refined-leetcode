import { useEffect, useRef, useState } from 'react'

function formatTime(time: number) {
  time = time / 1000
  const house = Math.floor(time / 3600)
  const minute = Math.floor((time / 60) % 60)
  const second = Math.floor(time % 60)
  return [house, minute, second]
}

type UseTimeReturn = {
  time: number[]
  isDone: boolean
  done: (fn?: (time: number[]) => void) => void
  restart: () => void
}

const useTimer = (): UseTimeReturn => {
  const [start, setStart] = useState(new Date())
  const [isDone, setIsDone] = useState(false)
  const [time, setTime] = useState(formatTime(0))
  const cacheTime = useRef(time)
  cacheTime.current = time
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

  const restart = () => {
    setIsDone(false)
    setStart(new Date())
    setTime(formatTime(0))
  }

  const done = (fn?: (time: number[]) => void) => {
    setIsDone(true)

    if (fn) {
      fn(cacheTime.current)
    }
  }

  return { time, isDone, done, restart }
}

export { useTimer }
