/**
 * @type {import('eslint').Linter.Config} config
 */
const eslintConfig = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    // ========================================
    // 禁用某些对象的属性
    // ========================================
    'no-restricted-properties': [
      'error',
      { property: 'substring', message: 'Use .slice instead of .substring.' },
      { property: 'substr', message: 'Use .slice instead of .substr.' },
      {
        object: 'assert',
        property: 'equal',
        message: 'Use assert.strictEqual instead of assert.equal.',
      },
      {
        object: 'assert',
        property: 'notEqual',
        message: 'Use assert.notStrictEqual instead of assert.notEqual.',
      },
      {
        object: 'assert',
        property: 'deepEqual',
        message: 'Use assert.deepStrictEqual instead of assert.deepEqual.',
      },
      {
        object: 'assert',
        property: 'notDeepEqual',
        message:
          'Use assert.notDeepStrictEqual instead of assert.notDeepEqual.',
      },
    ],

    'react/jsx-filename-extension': [2, { extensions: ['.tsx'] }],

    // 当启用新的 JSX 转换时,可以关闭下面两条规则
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',

    'react/prop-types': 'off',
    'react/self-closing-comp': [
      'error',
      {
        component: true,
        html: true,
      },
    ],

    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          '{}': false,
        },
      },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // https://styled-components.com/docs/tooling#enforce-macro-imports
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'styled-components',
            message: 'Please import from styled-components/macro.',
          },
        ],
        patterns: ['!styled-components/macro'],
      },
    ],

    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': ['error'],
        '@typescript-eslint/explicit-member-accessibility': ['error'],
      },
    },
  ],
  ignorePatterns: ['**/node_modules/**', 'dist', 'lib', '**/__snapshots__/**'],
}

module.exports = eslintConfig
