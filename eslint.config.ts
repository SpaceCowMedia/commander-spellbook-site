import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import cypress from 'eslint-plugin-cypress';
import prettier from 'eslint-plugin-prettier/recommended';
import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  reactHooks.configs.flat.recommended,
  react.configs.flat.recommended,
  cypress.configs.recommended,
  prettier,
  prettierConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: '19' },
    },
    rules: {
      'react/no-deprecated': 'warn' as const,
      'react/no-direct-mutation-state': 'error' as const,
      'react/no-unescaped-entities': 'off' as const,
      'react-hooks/exhaustive-deps': 'off' as const,
      '@next/next/no-img-element': 'off' as const,
      'prettier/prettier': [
        'error',
        {
          trailingComma: 'all' as const,
          eslintIntegration: true as boolean,
          printWidth: 120 as number,
          singleQuote: true as boolean,
        },
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_' as string,
          varsIgnorePattern: '^_' as string,
          caughtErrorsIgnorePattern: '^_' as string,
        },
      ],
      curly: ['error', 'all'] as const,
    },
  },
  {
    files: ['**/*.config.js', '**/*.config.ts', '**/*.config.mjs'],
    rules: {
      'import/no-anonymous-default-export': 'off' as const,
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    'node_modules/**',
    '.next/**',
    '_next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
);
