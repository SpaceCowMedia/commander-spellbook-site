<template>
  <div class="container py-4">
    <p class="p-2 my-2">
      This is a list of every result in the combo database with the number of
      combos they are in and direct links to the combos as long as the number of
      combos that contain the result is less than 6.
    </p>
    <p v-for="(result, index) in results" :key="index" class="p-2 my-1">
      <TextWithMagicSymbol :text="result.text" />
      -
      <nuxt-link :to="{ path: 'search', query: { q: search(result.text) } }">
        {{ result.numberOfCombos }} combo<span v-if="result.numberOfCombos > 1"
          >s</span
        >
      </nuxt-link>
      <span v-if="result.numberOfCombos < 6">
        (
        <span
          v-for="(id, comboIndex) in result.ids"
          :key="result.text + '-' + id"
        >
          <span v-if="comboIndex !== 0"> | </span>
          <nuxt-link :to="'/combo/' + id">{{ id }}</nuxt-link> </span
        >)</span
      >
    </p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import TextWithMagicSymbol from "@/components/TextWithMagicSymbol.vue";
import spellbookApi from "commander-spellbook";

type Data = {
  results: { text: string; numberOfCombos: number; ids: string[] }[];
};

function formatSearch(result: string): string {
  let quotes = "'";

  if (result.includes("'")) {
    quotes = '"';
  }

  return `include:banned result=${quotes}${result}${quotes}`;
}

export default Vue.extend({
  components: {
    TextWithMagicSymbol,
  },
  async asyncData() {
    const options = await spellbookApi.autocomplete("results", "");

    const results = await Promise.all(
      options.map((result) => {
        return spellbookApi
          .search(formatSearch(result.value))
          .then((payload) => {
            const combos = payload.combos;

            return {
              text: result.label,
              numberOfCombos: combos.length,
              ids: combos.map((c) => c.commanderSpellbookId),
            };
          });
      })
    );

    results.sort((a, b) => {
      if (a.numberOfCombos > b.numberOfCombos) {
        return 1;
      }
      if (b.numberOfCombos > a.numberOfCombos) {
        return -1;
      }

      return 0;
    });

    return {
      results,
    };
  },
  data(): Data {
    return {
      results: [],
    };
  },
  methods: {
    search(result: string): string {
      return formatSearch(result);
    },
  },
});
</script>

<style>
/* styles here */
</style>
