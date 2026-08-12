import type { Config } from 'stylelint';

export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    // The only rule stylelint-config-prettier-scss still disabled; its other 15 targeted
    // scss/* rules that no longer exist. Prettier does not manage blank lines before at-rules.
    'at-rule-empty-line-before': null,
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
        ignoreAtRules: ['tailwind', 'reference'],
      },
    ],
  },
} satisfies Config;
