/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

/**
 * @type {import('webpack').Configuration}
 */
const common = {
  entry: {
    popup: path.join(__dirname, '../src/popup/index.tsx'),
    content: path.join(__dirname, '../src/content/index.tsx'),
    'content-load': path.join(__dirname, '../src/content/load.ts'),
    background: path.join(__dirname, '../src/background/index.ts'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/',
    clean: true,
  },
  resolve: {
    alias: {
      'react/jsx-runtime': 'react/jsx-runtime.js',
      '@': path.join(__dirname, '../src/content'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
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
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../public', 'popup.html'),
      chunks: ['popup'],
      filename: 'popup.html',
      publicPath: '/',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'icons/*.png', context: path.resolve('public') },
        { from: 'file-icons/*.svg', context: path.resolve('public') },
      ],
    }),
  ],
}

module.exports = { common }
