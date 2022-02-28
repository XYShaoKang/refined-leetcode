/**
 * @ee https://github.com/webpack/webpack/blob/13a3bc13736e3b7066779623939e9fdaec7bc06b/lib/RuntimePlugin.js#L361
 */
const { RuntimeGlobals } = require('webpack')
const ContentLoadScriptRuntimeModule = require('./ContentLoadScriptRuntimeModule')
const BackgroundLoadScriptRuntimeModule = require('./BackgroundLoadScriptRuntimeModule')
const DefaultLoadScriptRuntimeModule = require('webpack/lib/runtime/LoadScriptRuntimeModule')

class ChromeExtensionsDevHMRPlugin {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks.thisCompilation.tap(
        'ChromeExtensionsDevHMRPlugin',
        compilation => {
          compilation.hooks.runtimeRequirementInTree
            .for(RuntimeGlobals.loadScript)
            .tap('RuntimePlugin', (chunk, set) => {
              const withCreateScriptUrl =
                !!compilation.outputOptions.trustedTypes
              if (withCreateScriptUrl) {
                set.add(RuntimeGlobals.createScriptUrl)
              }

              switch (chunk.name) {
                case 'content-load':
                  compilation.addRuntimeModule(
                    chunk,
                    new ContentLoadScriptRuntimeModule(withCreateScriptUrl)
                  )
                  break
                case 'background':
                  compilation.addRuntimeModule(
                    chunk,
                    new BackgroundLoadScriptRuntimeModule(withCreateScriptUrl)
                  )
                  break

                default:
                  compilation.addRuntimeModule(
                    chunk,
                    new DefaultLoadScriptRuntimeModule(withCreateScriptUrl)
                  )
                  break
              }

              return true
            })
        }
      )
    }
  }
}

module.exports = ChromeExtensionsDevHMRPlugin
