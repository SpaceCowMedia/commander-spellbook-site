<template>
  <nuxt-link :to="link">
    <div class="search-snippet">
      <div class="search-snippet-header gradient">{{ search }}</div>
      <p class="description">{{ description }}</p>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    search: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  computed: {
    link() {
      return {
        path: "/search/",
        query: {
          q: this.search,
        },
      };
    },
  },
});
</script>

<style scoped>
a {
  @apply text-dark no-underline;
}

.search-snippet {
  @apply border-2 border-dark pb-2 mb-4 rounded-sm;
}

.search-snippet .search-snippet-header,
.search-snippet .description {
  @apply pl-4 pr-4 pt-2;
}

.search-snippet .search-snippet-header {
  @apply text-dark border-dark border-b-2 py-1 font-mono;
}
</style>
