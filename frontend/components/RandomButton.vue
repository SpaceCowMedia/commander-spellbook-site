<template>
  <nuxt-link :to="link">
    <slot />
  </nuxt-link>
</template>

<script lang="ts">
import Vue from "vue";

type NuxtLinkTo = {
  path: string;
  query?: {
    q?: string | (string | null)[];
  };
};

export default Vue.extend({
  props: {
    query: {
      type: String,
      default: "",
    },
  },
  computed: {
    link(): NuxtLinkTo {
      const link: NuxtLinkTo = { path: "/random/" };

      if (this.query.trim()) {
        link.query = { q: this.query };
      }

      return link;
    },
  },
});
</script>
