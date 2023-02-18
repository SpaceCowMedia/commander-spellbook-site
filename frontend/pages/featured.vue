<template>
  <div class="static-page">
    <ArtCircle
      card-name="Thespian's Stage"
      artist="John Avon"
      class="m-auto md:block hidden"
    />
    <h1 class="heading-title">Featured Combos</h1>

    <div class="container sm:flex flex-row">
      <div v-if="combos.length > 0" class="w-full">
        <ComboResults :results="combos" />
      </div>
      <div v-else>
        <p>No Featured combos at this time!</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ComboResults from "@/components/search/ComboResults.vue";
import ArtCircle from "@/components/ArtCircle.vue";
import getFeaturedCombos from "@/lib/api/get-featured-combos";
import { FormattedApiResponse } from "@/lib/api/types";

type Data = {
  combos: FormattedApiResponse[];
};

export default Vue.extend({
  name: "FeaturedPage",
  components: {
    ArtCircle,
    ComboResults,
  },
  async asyncData(): Promise<Data> {
    const featuredCombos = await getFeaturedCombos();

    return {
      combos: featuredCombos,
    };
  },
  data(): Data {
    return {
      combos: [],
    };
  },
  head() {
    return {
      title: "Commander Spellbook: Featured Combos",
    };
  },
});
</script>

<style scoped>
/* Styles here */
</style>
