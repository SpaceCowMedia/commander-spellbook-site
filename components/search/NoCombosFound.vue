<template>
  <div
    class="w-full sm:pt-32 sm:pb-32 flex content-center justify-center text-center"
  >
    <div :class="{ 'animate-pulse': !loaded }" class="mb-auto mt-auto p-10">
      <h3 class="heading-title">
        {{ title }}
      </h3>

      <ArtCircle
        class="m-auto mt-4 mb-4"
        card-name="Frantic Search"
        artist="Jeff Miracola"
      />

      <div
        class="no-combos-found-buttons"
        :class="{ 'opacity-0': !loaded, 'opacity-100': loaded }"
      >
        <p>
          Your search didn’t match any combos. Adjust your search or try one of
          the links below:
        </p>

        <div>
          <nuxt-link to="/advanced-search" class="button--red">
            Advanced Search
          </nuxt-link>
          <nuxt-link to="/syntax-guide" class="button--red">
            Syntax Guide
          </nuxt-link>
        </div>
      </div>

      <div class="text-xs text-gray-600 w-1/2 m-auto">
        <i class="flavor-text">{{ flavor }}</i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    loaded: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    title(): string {
      return this.loaded ? "No Combos Found" : "Looking for Combos";
    },
    flavor(): string {
      return this.loaded
        ? "The final pages of the experiment log were blank. Investigators found it abandoned on a desk in the researcher’s lab, open, the pages flipping in the wind from a shattered window."
        : "It’s hard to say which is more satisfying: the search for that missing piece or fitting that piece into place.";
    },
  },
});
</script>

<style scoped>
.no-combos-found-buttons {
  @apply transition-opacity duration-1000 ease-in-out;
}
</style>
