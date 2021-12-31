/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * @type {import('webpack').Configuration}
 */
const production = {
  devtool: 'source-map',
  mode: 'production',
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
}

module.exports = { production }
