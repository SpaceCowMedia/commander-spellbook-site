<template>
  <div class="sm:pt-32 sm:pb-32 flex content-center justify-center text-center">
    <div class="mb-auto mt-auto p-10">
      <h3 class="heading-title">No Combos Found</h3>

      <div
        class="card-art m-auto rounded-full mt-4 mb-4 h-64 w-64 bg-gray-400"
      ></div>

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

      <div class="text-xs text-gray-600 w-1/2 m-auto">
        <i
          >The final pages of the experiment log were blank. Investigators found
          it abandoned on a desk in the researcher’s lab, open, the pages
          flipping in the wind from a shattered window.</i
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({});
</script>

<style scoped>
.card-art {
  background-image: url("~assets/images/combo-not-found-frantic-search.jpg");
  background-position: center;
  background-size: cover;
}
</style>
