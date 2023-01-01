module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "@nuxtjs/eslint-config-typescript",
    "plugin:nuxt/recommended",
    "prettier",
  ],
  // add your custom rules here
  rules: {},
  parserOptions: {
    ecmaVersion: "latest",
  },
};
