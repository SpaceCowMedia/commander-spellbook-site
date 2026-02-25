import type { Config } from 'stylelint';

export default {
  extends: ['stylelint-config-standard', 'stylelint-config-standard-scss', 'stylelint-config-prettier-scss'],
  plugins: ['stylelint-scss'],
} satisfies Config;
