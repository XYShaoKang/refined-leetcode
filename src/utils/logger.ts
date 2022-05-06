import { format } from 'date-fns'
import pino from 'pino'

const MSG_TYPE: {
  [key: number]: 'trace' | 'debug' | 'info' | 'warn' | 'error'
} = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
}

const colored: { [key: number | string]: string } = {
  default: 'white',
  50: 'red',
  40: 'yellow',
  30: 'green',
  20: 'cornflowerblue',
  10: 'gray',
  message: 'white',
  gray: 'gray',
  background: '#202124',
}

const logger = pino({
  level: 'debug',
  browser: {
    write: ((o: {
      time: number
      level: number
      msg: string
      prefix: string | undefined
    }) => {
      const type = MSG_TYPE[o.level] ?? 'unknown'

      const time = `[${format(
        new Date(o.time),
        'yyyy-MM-dd HH:mm:ss.SSS xxxx'
      )}]`
      const msgType = type.toUpperCase().padStart(7, ' ')
      const prefix = o.prefix ? `(${o.prefix}) ` : ''
      const msgContext = o.msg

      const msg = `%c${time} %c${msgType} %c${prefix}: %c${msgContext}`

      // [时间] 类型 (前缀); 内容
      // [2022-05-03 20:00:00.000 +0800] INFO (fun): text
      let styles = [
        `color: ${colored.gray}`, // 时间
        `color: ${o.level in MSG_TYPE ? colored[o.level] : colored.gray}`, // 类型
        `color: ${colored.gray}`, // 前缀
        `color: ${colored.message}`, // 内容
      ]

      styles = styles.map(
        (str, i) =>
          `background:${colored.background};padding:5px ${
            i === styles.length - 1 ? 5 : 0
          }px 5px ${i === 0 ? 5 : 0}px;${str}`
      )

      if (o.level in MSG_TYPE) {
        console[type](msg, ...styles)
      } else {
        console.log(msg, ...styles)
      }
    }) as (o: any) => void,
  },
})

export default logger
