const CopyPlugin = require('copy-webpack-plugin')

/**
 * @type {import('webpack').Configuration}
 */
const production = {
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public/manifest.json', to: 'manifest.json' }],
    }),
  ],
  devtool: 'source-map',
  mode: 'production',
}

module.exports = { production }
