import type { Plugin } from "@nuxt/types";

declare module "vue/types/vue" {
  interface Vue {
    $pluralize: typeof pluralize;
  }
}

const pluralize = (word: string, count: number, alternative = "") => {
  if (count === 1) {
    return word;
  }
  return alternative || `${word}s`;
};

export { pluralize };

const textHelpersPlugin: Plugin = (_, inject) => {
  inject("pluralize", pluralize);
};

export default textHelpersPlugin;
