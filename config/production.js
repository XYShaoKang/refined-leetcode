const CopyPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

/**
 * @type {import('webpack').Configuration}
 */
const production = env => ({
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public/manifest.json', to: 'manifest.json' }],
    }),
    new webpack.DefinePlugin({
      REFINED_LEETCODE_LOG_LEVEL: env.LOG_LEVEL
        ? JSON.stringify(env.LOG_LEVEL)
        : JSON.stringify('error'),
    }),
  ],
  devtool: 'source-map',
  mode: 'production',
})

module.exports = { production }
