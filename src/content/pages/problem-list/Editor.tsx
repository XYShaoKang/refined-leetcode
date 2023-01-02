import { ChangeEventHandler, FC, useEffect, useRef, useState } from 'react'

import { Input } from '@/components/Input'
import Button from '@/components/Button'
import ErrorToolTip from '@/components/ErrorToolTip'

interface EditorProps {
  text?: string
  onSave?: (text: string) => void | Promise<void>
  onCancel?: (...arg: any) => void
}

const Editor: FC<EditorProps> = ({ text: initText = '', onSave, onCancel }) => {
  const [text, setText] = useState(initText)
  const [error, setError] = useState({ message: '', show: false })
  const [loading, setLoading] = useState(false)
  // 判断当前组件是否挂载，还是已被卸载
  const isMount = useRef<boolean>()

  useEffect(() => {
    isMount.current = true
    return () => {
      isMount.current = false
    }
  }, [])
  useEffect(() => {
    if (error.show) {
      setTimeout(() => {
        setError({ ...error, show: false })
      }, 1000)
    }
  }, [error])

  const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
    setText(e.target.value)
  }

  const handleSave = async () => {
    setLoading(true)
    if (typeof onSave === 'function') {
      try {
        await onSave(text)
        if (isMount.current) setText('')
      } catch (error: any) {
        setError({ message: error.message, show: true })
      }
    }
    if (isMount.current) setLoading(false)
  }
  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel()
    }
  }

  return (
    <div
      css={`
        width: 100%;
      `}
    >
      <ErrorToolTip error={error}>
        <Input
          type="text"
          name="add-problem-list"
          id="add-problem-list"
          value={text}
          onChange={handleChange}
          style={{
            height: 24,
            padding: '2px 11px',
          }}
        />
      </ErrorToolTip>
      <div
        css={`
          display: flex;
          justify-content: space-around;
          margin-top: 6px;
        `}
      >
        <Button
          css={`
            && {
              height: 24px;
              background-color: #555;
              &:hover {
                background-color: #444;
              }
            }
          `}
          onClick={handleCancel}
        >
          取消
        </Button>
        <Button
          style={{ height: 24 }}
          disabled={!text}
          loading={loading}
          onClick={handleSave}
        >
          保存
        </Button>
      </div>
    </div>
  )
}

export default Editor
