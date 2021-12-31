module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          './*.*',
        ],
      },
    ],

    '@typescript-eslint/explicit-module-boundary-types': 0,

    // generic type parameters
    'no-spaced-func': 0,
    'func-call-spacing': 0,
    '@typescript-eslint/func-call-spacing': 2,

    // parameters with public/protected/private in class constructor
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 2,

    indent: 0,
    '@typescript-eslint/indent': [
      'error',
      2,
    ],

    'no-shadow': 0,
    '@typescript-eslint/no-shadow': 2,

    semi: 0,
    '@typescript-eslint/semi': 2,

    'no-empty-function': 0,
    '@typescript-eslint/no-empty-function': 2,

    'no-useless-constructor': 0,
    '@typescript-eslint/no-useless-constructor': 2,

    '@typescript-eslint/no-explicit-any': 0,

    '@typescript-eslint/type-annotation-spacing': 2,

    'no-inner-declarations': 0,

    'max-statements-per-line': ['error', { max: 1 }],

    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
  },
};
