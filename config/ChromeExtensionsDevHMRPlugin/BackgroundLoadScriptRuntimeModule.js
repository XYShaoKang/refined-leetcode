/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/

/**
 * @see https://github.com/webpack/webpack/blob/13a3bc13736e3b7066779623939e9fdaec7bc06b/lib/runtime/LoadScriptRuntimeModule.js
 */

'use strict'

const { SyncWaterfallHook } = require('tapable')
const {
  Compilation,
  RuntimeGlobals,
  Template,
  RuntimeModule,
} = require('webpack')

/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */

/**
 * @typedef {Object} LoadScriptCompilationHooks
 * @property {SyncWaterfallHook<[string, Chunk]>} createScript
 */

/** @type {WeakMap<Compilation, LoadScriptCompilationHooks>} */
const compilationHooksMap = new WeakMap()

class LoadScriptRuntimeModule extends RuntimeModule {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {LoadScriptCompilationHooks} hooks
   */
  static getCompilationHooks(compilation) {
    if (!(compilation instanceof Compilation)) {
      throw new TypeError(
        "The 'compilation' argument must be an instance of Compilation"
      )
    }
    let hooks = compilationHooksMap.get(compilation)
    if (hooks === undefined) {
      hooks = {
        createScript: new SyncWaterfallHook(['source', 'chunk']),
      }
      compilationHooksMap.set(compilation, hooks)
    }
    return hooks
  }

  /**
   * @param {boolean=} withCreateScriptUrl use create script url for trusted types
   */
  constructor(withCreateScriptUrl) {
    super('load script')
    this._withCreateScriptUrl = withCreateScriptUrl
  }

  /**
   * @returns {string} runtime code
   */
  generate() {
    const { compilation } = this
    const { runtimeTemplate, outputOptions } = compilation
    const {
      scriptType,
      chunkLoadTimeout: loadTimeout,
      crossOriginLoading,
      uniqueName,
      charset,
    } = outputOptions
    const fn = RuntimeGlobals.loadScript

    const { createScript } =
      LoadScriptRuntimeModule.getCompilationHooks(compilation)

    const code = Template.asString([
      "script = document.createElement('script');",
      scriptType ? `script.type = ${JSON.stringify(scriptType)};` : '',
      charset ? "script.charset = 'utf-8';" : '',
      `script.timeout = ${loadTimeout / 1000};`,
      `if (${RuntimeGlobals.scriptNonce}) {`,
      Template.indent(
        `script.setAttribute("nonce", ${RuntimeGlobals.scriptNonce});`
      ),
      '}',
      uniqueName
        ? 'script.setAttribute("data-webpack", dataWebpackPrefix + key);'
        : '',
      `script.src = ${
        this._withCreateScriptUrl
          ? `${RuntimeGlobals.createScriptUrl}(url)`
          : 'url'
      };`,
      crossOriginLoading
        ? Template.asString([
            "if (script.src.indexOf(window.location.origin + '/') !== 0) {",
            Template.indent(
              `script.crossOrigin = ${JSON.stringify(crossOriginLoading)};`
            ),
            '}',
          ])
        : '',
    ])
    const res = `
    var inProgress = {};
    ${
      uniqueName
        ? `var dataWebpackPrefix = ${JSON.stringify(uniqueName + ':')};`
        : '// data-webpack is not used as build has no uniqueName'
    }
    // loadScript function to load a script via script tag
    ${fn} = (url, done, key, chunkId) => {
      if(inProgress[url]) { inProgress[url].push(done); return; }
      // var script, needAttach;
      // if(key !== undefined) {
        // var scripts = document.getElementsByTagName("script");
        // for(var i = 0; i < scripts.length; i++) {
          // var s = scripts[i];
          // if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == // dataWebpackPrefix + key) { script = s; break; }
        // }
      // }
      // if(!script) {
        // needAttach = true;
        // script = document.createElement('script');

        // script.charset = 'utf-8';
        // script.timeout = 120;
        // if (__webpack_require__.nc) {
        //   script.setAttribute("nonce", __webpack_require__.nc);
        // }
        // script.setAttribute("data-webpack", dataWebpackPrefix + key);
        // script.src = url;
      // }
      inProgress[url] = [done];
      var onScriptComplete = (prev, event) => {
        // avoid mem leaks in IE.
        // script.onerror = script.onload = null;
        // clearTimeout(timeout);
        var doneFns = inProgress[url];
        delete inProgress[url];
        // script.parentNode && script.parentNode.removeChild(script);
        doneFns && doneFns.forEach((fn) => (fn(event)));
        if(prev) return prev(event);
      }
      ;
      // chrome.runtime.sendMessage({type: 'hot-update',url},function(response) { console.log(response) })
      //chrome.runtime.reload()
      // var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
      // script.onerror = onScriptComplete.bind(null, script.onerror);
      // script.onload = onScriptComplete.bind(null, script.onload);
      // needAttach && document.head.appendChild(script);
    };
    `

    if (res) {
      return res
    }

    return Template.asString([
      'var inProgress = {};',
      uniqueName
        ? `var dataWebpackPrefix = ${JSON.stringify(uniqueName + ':')};`
        : '// data-webpack is not used as build has no uniqueName',
      '// loadScript function to load a script via script tag',
      `${fn} = ${runtimeTemplate.basicFunction('url, done, key, chunkId', [
        'if(inProgress[url]) { inProgress[url].push(done); return; }',
        'var script, needAttach;',
        'if(key !== undefined) {',
        Template.indent([
          'var scripts = document.getElementsByTagName("script");',
          'for(var i = 0; i < scripts.length; i++) {',
          Template.indent([
            'var s = scripts[i];',
            `if(s.getAttribute("src") == url${
              uniqueName
                ? ' || s.getAttribute("data-webpack") == dataWebpackPrefix + key'
                : ''
            }) { script = s; break; }`,
          ]),
          '}',
        ]),
        '}',
        'if(!script) {',
        Template.indent([
          'needAttach = true;',
          createScript.call(code, this.chunk),
        ]),
        '}',
        'inProgress[url] = [done];',
        'var onScriptComplete = ' +
          runtimeTemplate.basicFunction(
            'prev, event',
            Template.asString([
              '// avoid mem leaks in IE.',
              '//script.onerror = script.onload = null;',
              '//clearTimeout(timeout);',
              'var doneFns = inProgress[url];',
              'delete inProgress[url];',
              '//script.parentNode && script.parentNode.removeChild(script);',
              `doneFns && doneFns.forEach(${runtimeTemplate.returningFunction(
                'fn(event)',
                'fn'
              )});`,
              'if(prev) return prev(event);',
            ])
          ),
        ';',
        `//var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), ${loadTimeout});`,
        '//script.onerror = onScriptComplete.bind(null, script.onerror);',
        '//script.onload = onScriptComplete.bind(null, script.onload);',
        "chrome.runtime.sendMessage({type: 'hot-update',url},function(response) { console.log(response.data) })",
        '//needAttach && document.head.appendChild(script);',
      ])};`,
    ])
  }
}

module.exports = LoadScriptRuntimeModule
