/* eslint-disable @typescript-eslint/no-var-requires */
const packageData = require('../package.json')

class UserscriptPlugin {
  /**
   *
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    const { webpack, options } = compiler
    let mode = 'development'
    if (
      options.mode !== 'development' ||
      (process.env.NODE_ENV && process.env.NODE_ENV === 'production')
    ) {
      mode = 'production'
    }

    const pluginName = UserscriptPlugin.name
    const { ConcatSource, RawSource } = webpack.sources

    let HEADER = ''
    if (mode === 'development') {
      HEADER = `// ==UserScript==
// @name         leetcode-extend-dev
// @namespace    https://github.com/xyshaokang/leetcode-extend
// @version      ${packageData.version}
// @description  力扣扩展
// @author       XYShaoKang
// @match        https://leetcode-cn.com/*
// @match        https://leetcode.com/*
// ==/UserScript==

`
    } else {
      HEADER = `// ==UserScript==
// @name         leetcode-extend
// @namespace    https://github.com/xyshaokang/leetcode-extend
// @version      ${packageData.version}
// @description  力扣扩展
// @author       XYShaoKang
// @match        https://leetcode-cn.com/*
// @match        https://leetcode.com/*
// @require      https://unpkg.com/react@17/umd/react.production.min.js
// @require      https://unpkg.com/react-dom@17/umd/react-dom.production.min.js
// ==/UserScript==

`
    }

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'generater-image-plugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        () => {
          const filename = 'main.user.js'
          if (mode === 'development') {
            const newFile = 'main.js'
            const content = `const script = document.createElement('script')
script.src = 'http://localhost:9000/${newFile}'
document.body.append(script)
`
            compilation.emitAsset(newFile, compilation.assets[filename])

            compilation.updateAsset(
              filename,
              () => new RawSource(HEADER + content)
            )
          } else {
            compilation.updateAsset(
              filename,
              file => new ConcatSource(HEADER, file)
            )
          }
        }
      )
    })
  }
}

module.exports = UserscriptPlugin
