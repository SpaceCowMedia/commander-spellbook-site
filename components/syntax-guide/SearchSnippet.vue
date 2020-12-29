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
.search-snippet {
  border-color: rgb(92, 126, 159);
  @apply border-2 pb-2 mb-4;
}

.search-snippet pre,
.search-snippet .description {
  @apply pl-4 pr-4 pt-2;
}

.search-snippet pre {
  background: rgb(92, 126, 159);
  border-color: rgb(92, 126, 159);
  @apply text-white pb-2 pt-1;
}
</style>
