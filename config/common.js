/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const UserscriptPlugin = require('../src/userscriptPlugin')

/**
 * @type {import('webpack').Configuration}
 */
const common = {
  entry: path.join(__dirname, '../src/index.tsx'),
  output: {
    filename: 'main.user.js',
    path: path.join(__dirname, '../dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: { path: false },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
    ],
  },
  plugins: [new UserscriptPlugin()],
}

module.exports = { common }
