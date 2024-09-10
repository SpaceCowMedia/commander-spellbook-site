module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:prettier/recommended', 'next/core-web-vitals'],
  plugins: ['react', 'react-hooks', 'prettier'],
  // add your custom rules here
  rules: {
    'react/no-deprecated': 'warn', // Warn about deprecated lifecycle methods
    'react/no-direct-mutation-state': 'error', // Prevent direct state mutation
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@next/next/no-img-element': 'off',
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'all',
        eslintIntegration: true,
        printWidth: 120,
      },
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    curly: ['error', 'all'],
  },
  overrides: [
    {
      files: ['*.config.js', '*.config.ts'],
      rules: {
        'import/no-anonymous-default-export': 'off',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
