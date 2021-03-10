import defaultConfig from "../nuxt.config";

export default {
  ...defaultConfig,

  // these pages serve to generate the various combo
  // detail pages and provide interesting metadata
  // to admins managing the database.
  // To speed up ci, we don't force it to generate
  // each static combo page. Combo 450 will still
  // be generated due to other links in the syntax
  // guide
  ignore: ["pages/meta/*.vue"],
};
