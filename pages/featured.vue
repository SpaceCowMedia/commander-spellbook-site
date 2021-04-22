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
import ComboResults, {
  ComboResult,
} from "@/components/search/ComboResults.vue";
import ArtCircle from "@/components/ArtCircle.vue";
import getAllCombos from "@/lib/api/get-all-combos";

type Data = {
  combos: ComboResult[];
};

export default Vue.extend({
  components: {
    ArtCircle,
    ComboResults,
  },
  async asyncData(): Promise<Data> {
    const allCombos = await getAllCombos();
    const featuredCombos = allCombos
      .filter((combo) => {
        return combo.cards.isFeatured();
      })
      .map((combo) => {
        return {
          id: combo.commanderSpellbookId,
          names: combo.cards.map((c) => c.name),
          results: Array.from(combo.results),
          colors: Array.from(combo.colorIdentity.colors),
        };
      });

    return {
      combos: featuredCombos,
    };
  },
  data(): Data {
    return {
      combos: [],
    };
  },
});
</script>

<style scoped>
/* Styles here */
</style>
