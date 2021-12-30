/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

/**
 * @type {import('webpack').Configuration}
 */
const development = {
  target: 'web',
  output: {
    publicPath: 'http://localhost:9000/',
  },
  devServer: {
    host: 'localhost',
    port: 9000,
    hot: true,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    new ReactRefreshWebpackPlugin({
      exclude: /node_modules/,
      include: path.resolve(__dirname, '../src'),
      overlay: false,
    }),
  ],
  devtool: 'eval-source-map',
  mode: 'development',
}

module.exports = { development }
