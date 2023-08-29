const parserOptions = {
  ecmaVersion: 2020,
  // ECMAScript modules 模式
  sourceType: 'module',
  ecmaFeatures: {
    // 不允许 return 语句出现在 global 环境下
    globalReturn: false,
    // 开启全局 script 模式
    impliedStrict: true,
  },
  // 仅允许 import export 语句出现在模块的顶层
  allowImportExportEverywhere: false,
};

const project = ['./tsconfig.json', './packages/*/tsconfig.json'];

module.exports = {
  root: true,
  extends: [
    'eslint-config-airbnb-base',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
  ],
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    es2020: true,
    jest: true,
    browser: true,
  },
  parserOptions,
  globals: {
    ajx: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  rules: {
    // 此项目 require 在 devDependencies 是正常的
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'lines-between-class-members': 'off',
    'no-shadow': 'off',
    'max-classes-per-file': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'warn',
    'no-use-before-define': 'off',
    // 覆盖 airbnb 的默认规则，去除 for of 约束
    // https://eslint.org/docs/rules/no-restricted-syntax
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-restricted-globals': 'off',
    'promise/no-callback-in-promise': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:import/typescript', 'plugin:@typescript-eslint/recommended'],
      parserOptions: {
        project,
      },
      rules: {
        '@typescript-eslint/no-use-before-define': ['error'],
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
  ],
};
