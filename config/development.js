/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const webpack = require('webpack')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const ChromeExtensionsDevHMRPlugin = require('./ChromeExtensionsDevHMRPlugin')

/**
 * @type {import('webpack').Configuration}
 */
const development = env => ({
  output: {
    publicPath: 'http://localhost:9100/',
  },
  entry: {
    options: [
      'webpack/hot/dev-server.js',
      'webpack-dev-server/client/index.js?hot=true&protocol=ws&hostname=localhost&port=9100',
      path.join(__dirname, '../src/options/index.tsx'),
    ],
    popup: [
      'webpack/hot/dev-server.js',
      'webpack-dev-server/client/index.js?hot=true&protocol=ws&hostname=localhost&port=9100',
      path.join(__dirname, '../src/popup/index.tsx'),
    ],
    content: [
      'webpack/hot/dev-server.js',
      'webpack-dev-server/client/index.js?hot=true&protocol=ws&hostname=localhost&port=9100',
      path.join(__dirname, '../src/content/index.tsx'),
    ],
    'content-load': [
      'webpack/hot/dev-server.js',
      'webpack-dev-server/client/index.js?hot=true&protocol=ws&hostname=localhost&port=9100',
      path.join(__dirname, '../src/content/load.ts'),
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '../dist'),
      watch: false,
    },
    host: 'localhost',
    port: 9100,
    hot: false,
    devMiddleware: {
      writeToDisk: true,
    },
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    client: false,
  },
  plugins: [
    new ReactRefreshWebpackPlugin({ overlay: false }),
    new webpack.SourceMapDevToolPlugin({
      publicPath: 'http://localhost:9100/',
    }),
    new ChromeExtensionsDevHMRPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new CopyPlugin({
      patterns: [{ from: 'public/manifest-dev.json', to: 'manifest.json' }],
    }),
    new webpack.DefinePlugin({
      REFINED_LEETCODE_LOG_LEVEL: env.LOG_LEVEL
        ? JSON.stringify(env.LOG_LEVEL)
        : JSON.stringify('debug'),
    }),
    new webpack.BannerPlugin({
      banner: file => {
        if (file.filename === 'content.bundle.js') {
          return `
          const frame = document.createElement('frame')
          frame.style.display = 'none'
          document.body.append(frame)
          const console = frame.contentWindow.console
          window.console = console;`
        }
        return ''
      },
      raw: true,
    }),
  ],
  devtool: false,
  mode: 'development',
})

module.exports = { development }
