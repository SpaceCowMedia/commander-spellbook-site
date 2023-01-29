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
  rules: {
    // prettier messes this up by breaking up the attributes in the HTML
    "vue/first-attribute-linebreak": 0,
  },
};
