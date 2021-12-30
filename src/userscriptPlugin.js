/* eslint-disable @typescript-eslint/no-var-requires */
const ConcatSource = require('webpack-sources').ConcatSource
const packageData = require('../package.json')

class UserscriptPlugin {
  /**
   *
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    const pluginName = UserscriptPlugin.name
    const { webpack } = compiler

    const HEADER = `// ==UserScript==
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

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'generater-image-plugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        () => {
          compilation.updateAsset(
            'main.user.js',
            file => new ConcatSource(HEADER, file)
          )
        }
      )
    })
  }
}

module.exports = UserscriptPlugin
