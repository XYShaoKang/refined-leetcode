import React, { FC, useState } from 'react'
import styled, { css } from 'styled-components/macro'

import { LeetCodeApi } from './leetcode-api'
import { download } from './utils'

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
`

const Button = styled.a<{ primary?: boolean }>`
  background: transparent;
  border-radius: 3px;
  border: 2px solid palevioletred;
  color: palevioletred;
  margin: 0.5em 1em;
  padding: 0.25em 1em;
  width: 150px;
  text-align: center;

  ${props =>
    props.primary &&
    css`
      background: palevioletred;
      color: white;
    `}
`

const App: FC = () => {
  const [option, setOption] = useState({ runtime: true, memory: false })
  const [isDownloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const key = e.target.id as 'runtime' | 'memory'
    setOption(option => ({ ...option, [key]: !option[key] }))
  }
  const handleClick = async function () {
    setDownloading(true)
    const pathnames = location.pathname.split('/').filter(Boolean)
    const leetCodeApi = new LeetCodeApi(location.origin)
    const data = await leetCodeApi.getSubmissionDetail(
      pathnames[pathnames.length - 1]
    )
    const allQuestions = await leetCodeApi.getAllQuestions()
    const { questionId, lang } = data
    const question = allQuestions.find(q => q.questionId === questionId)
    let res = `# ${question?.title} - ${lang}\n\n`
    const cache = new Set<string>()

    const total =
      (option.runtime
        ? data.runtimeDistribution?.distribution.length ?? 0
        : 0) +
      (option.memory ? data.memoryDistribution?.distribution.length ?? 0 : 0)

    let progress = 0
    if (option.runtime) {
      const time = data.runtimeDistribution
      res += `## 用时分布代码\n\n`
      if (time) {
        const { lang, distribution } = time
        for (const [t] of distribution) {
          const code = await leetCodeApi.getCodeByTime(lang, questionId, t)

          res += `### ${t}ms\n\n`
          res += `\`\`\`${lang}\n${code}\n\`\`\`\n\n`
          cache.add(code)
          progress++
          setProgress(progress / total)
        }
      }
    }
    if (option.memory) {
      const memory = data.memoryDistribution
      res += `## 小号内存分布分布代码\n\n`
      if (memory) {
        const { lang, distribution } = memory
        for (const [m] of distribution) {
          const code = await leetCodeApi.getCodeByMemory(lang, questionId, m)
          if (cache.has(code)) continue

          res += `### ${m}kb\n\n`
          res += `\`\`\`${lang}\n${code}\n\`\`\`\n\n`

          progress++
          setProgress(progress / total)
        }
      }
    }
    download(res, `${question?.titleSlug}-${lang}.md`)
    setDownloading(false)
    setProgress(0)
  }

  return (
    <Container>
      <div>
        <input
          type="checkbox"
          name="runtime"
          id="runtime"
          onChange={handleChange}
          checked={option.runtime}
        />
        <label htmlFor="runtime">运行时间</label>
      </div>
      <div>
        <input
          type="checkbox"
          name="memory"
          id="memory"
          onChange={handleChange}
          checked={option.memory}
        />
        <label htmlFor="memory">运行内存</label>
      </div>
      <Button onClick={isDownloading ? undefined : handleClick}>
        {isDownloading ? `下载中... | ${(progress * 100) >>> 0}%` : '下载'}
      </Button>
    </Container>
  )
}

export default App
