<template>
  <div :id="id" class="search-guide border-b-2 border-gray-400 w-full">
    <div class="container mt-6 mb-6 pb-4">
      <div class="mt-4 mb-4 flex-none text-center md:flex items-center">
        <ArtCircle
          :card-name="headingCardName"
          :artist="headingArtistName"
          class="mr-4 md:block hidden"
          :size="7"
        />
        <h2 class="heading-title">{{ heading }}</h2>
      </div>

      <div class="flex-none md:flex w-full">
        <div class="description w-full md:w-1/2 flex-grow pl-4 pr-4 md:pl-0">
          <slot />
        </div>

        <div
          class="search-snippets w-full md:w-1/2 flex-grow pl-4 pr-4 md:pr-4"
        >
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
import ArtCircle from "@/components/ArtCircle.vue";
import SearchSnippet from "./SearchSnippet.vue";

export default Vue.extend({
  components: {
    ArtCircle,
    SearchSnippet,
  },
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
@media (min-width: 768px) {
  .search-guide:nth-child(even) .description {
    @apply order-last pr-0 pl-4;
  }

  .search-guide:nth-child(even) .search-snippets {
    @apply pl-0 pr-4;
  }
}

.search-guide:last-child {
  @apply border-0;
}

code {
  @apply text-primary bg-gray-200 pl-1 pr-1;
}

.description p {
  @apply mb-4;
}
</style>
