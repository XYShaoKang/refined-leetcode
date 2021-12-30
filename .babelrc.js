/**
 *
 * @param {import('@babel/core').ConfigAPI} api
 * @returns
 */
module.exports = api => {
  const BABEL_ENV = api.env()

  let targets = {}
  if (BABEL_ENV === 'test') {
    targets = { node: 'current' }
  } else if (BABEL_ENV === 'development') {
    targets =
      'last 1 chrome version, last 1 firefox version, last 1 safari version'
  } else if (BABEL_ENV === 'production') {
    targets = '>0.2%, not dead, not op_mini all'
  }

  /**
   * @type {import('@babel/core').TransformOptions}
   */
  const babelConfig = {
    presets: [
      ['@babel/env', { targets }],
      ['@babel/react', { runtime: 'automatic' }],
      '@babel/preset-typescript',
    ],
    plugins: [
      [
        'macros',
        {
          styledComponents: {
            pure: true,
            displayName: true,
          },
        },
      ],
      '@babel/plugin-proposal-class-properties',
      BABEL_ENV === 'development' && 'react-refresh/babel',
    ].filter(Boolean),
  }

  return babelConfig
}
