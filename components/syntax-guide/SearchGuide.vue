<template>
  <div :id="id" class="search-guide border-b-2 border-gray-400 w-full">
    <div class="container max-w-5xl mx-auto mt-6 mb-6 pb-4">
      <div class="mt-4 mb-4 flex items-center">
        <ArtCircle
          :cardName="headingCardName"
          :artist="headingArtistName"
          class="mr-4"
          :size="28"
        />
        <h2 class="heading-title">{{ heading }}</h2>
      </div>

      <div class="flex w-full">
        <div class="description w-1/2 flex-grow pr-4">
          <slot />
        </div>

        <div class="search-snippets w-1/2 flex-grow pl-4">
          <SearchSnippet
            v-for="(snippet, index) in snippets"
            :key="index + '-' + snippet.search"
            :search="snippet.search"
            :description="snippet.description"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    heading: {
      type: String,
      default: "",
    },
    headingCardName: {
      type: String,
      default: "",
    },
    headingArtistName: {
      type: String,
      default: "",
    },
    snippets: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    id() {
      return this.heading.toLowerCase().replace(" ", "-");
    },
  },
});
</script>

<style scoped>
.search-guide:nth-child(even) .description {
  @apply order-last pr-0 pl-4;
}

.search-guide:nth-child(even) .search-snippets {
  @apply pl-0 pr-4;
}

code {
  color: rgb(92, 126, 159);
  @apply bg-gray-200 pl-1 pr-1;
}

.description p {
  @apply mb-4;
}
</style>
