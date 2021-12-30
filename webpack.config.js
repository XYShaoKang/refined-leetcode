/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge')
const { common } = require('./config/common.js')
const { development } = require('./config/development.js')
const { production } = require('./config/production.js')

module.exports = (_env, _args) => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return merge(common, development)
    case 'production':
      return merge(common, production)
    default:
      throw new Error('No matching configuration was found!')
  }
}
