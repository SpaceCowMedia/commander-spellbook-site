<template>
  <nuxt-link :to="link">
    <div class="search-snippet">
      <pre class="font-mono">{{ search }}</pre>
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
      return `/search?q=${this.search}`;
    },
  },
});
</script>

<style scoped>
a {
  @apply text-dark no-underline;
}

.search-snippet {
  @apply border-2 border-primary pb-2 mb-4 rounded-sm;
}

.search-snippet pre,
.search-snippet .description {
  @apply pl-4 pr-4 pt-2;
}

.search-snippet pre {
  @apply text-white border-primary bg-primary pb-2 pt-1;
}
</style>
