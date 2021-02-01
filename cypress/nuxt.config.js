import defaultConfig from "../nuxt.config";

export default {
  ...defaultConfig,

  // this page generates a page for _each_ combo
  // to speed up ci, we don't force it to generate
  // a static page up front. Combo 450 will still
  // be generated due to other links in the syntax
  // guide
  ignore: ["pages/combo/index.vue"],
};
