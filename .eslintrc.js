module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier', 'unicorn', 'import', 'more'],
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    project: './tsconfig.eslint.json',
  },
  env: {
    es6: true,
    browser: false,
    node: true,
  },
  rules: {
    'linebreak-style': [2, 'unix'],
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    'unicorn/filename-case': ['error', { cases: { pascalCase: true, camelCase: true } }],
    'import/no-cycle': 'off',
    'unicorn/no-null': 'off',
    'func-names': ['warn', 'as-needed'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'unicorn/no-nested-ternary': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
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
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'more/no-then': 'warn',
    'comma-dangle': [2, 'always-multiline'],
    radix: 'off',
    quotes: [2, 'single'],
    semi: [2, 'always'],
    curly: [2, 'all'],
    eqeqeq: [2, 'smart'],
    'new-cap': 2,
    'no-case-declarations': 0,
    'class-methods-use-this': ['off'],
    'one-var-declaration-per-line': [1, 'initializations'],
    'import/no-extraneous-dependencies': ['off', { devDependencies: false }],
    'eslint-disable @typescript-eslint/no-explicit-any': 'off',
    'function-call-argument-newline': ['error', 'consistent'],
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    'require-await': [0, 'consistent'],
    'unicorn/numeric-separators-style': 'off',
  },
};
