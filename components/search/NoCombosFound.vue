<template>
  <SplashPage
    :title="title"
    :flavor="flavor"
    :pulse="!loaded"
    art-circle-card-name="Frantic Search"
    art-circle-artist-name="Jeff Miracola"
  >
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
  </SplashPage>
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
