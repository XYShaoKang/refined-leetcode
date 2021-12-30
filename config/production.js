/* eslint-disable @typescript-eslint/no-var-requires */
const UserscriptPlugin = require('../src/userscriptPlugin')

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
  plugins: [new UserscriptPlugin()],
}

module.exports = { production }
