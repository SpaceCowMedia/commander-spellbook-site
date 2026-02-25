import type { Config } from 'stylelint';

export default {
  extends: ['stylelint-config-standard', 'stylelint-config-standard-scss', 'stylelint-config-prettier-scss'],
  plugins: ['stylelint-scss'],
  rules: {
    'selector-class-pattern': [
      '^(__)?[a-z][a-zA-Z0-9]+$',
      {
        message: (selector: string) => `Expected class selector "${selector}" to be in camelCase`,
      },
    ],
    'selector-id-pattern': [
      '^(__)?[a-z][a-zA-Z0-9]+$',
      {
        message: (selector: string) => `Expected id selector "${selector}" to be in camelCase`,
      },
    ],
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind'],
      },
    ],
  },
} satisfies Config;
