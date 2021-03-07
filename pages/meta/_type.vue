<template>
  <div class="container py-4">
    <h1 class="heading-title text-center py-4">{{ autocompleteType }}</h1>
    <p v-for="(item, index) in items" :key="index" class="p-2 my-1">
      <TextWithMagicSymbol :text="item.text" />
      -
      <nuxt-link :to="{ path: '/search', query: { q: search(item.text) } }">
        {{ item.numberOfCombos }} combo<span v-if="item.numberOfCombos > 1"
          >s</span
        >
      </nuxt-link>
      <span v-if="item.numberOfCombos < 6">
        (
        <span v-for="(id, comboIndex) in item.ids" :key="item.text + '-' + id">
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
  items: { text: string; numberOfCombos: number; ids: string[] }[];
  autocompleteType: string;
};

function formatSearch(str: string, autocompleteType: string): string {
  let quotes = "'";

  if (str.includes("'")) {
    quotes = '"';
  }

  return `include:banned ${autocompleteType}=${quotes}${str}${quotes}`;
}

export default Vue.extend({
  components: {
    TextWithMagicSymbol,
  },
  async asyncData({ params }) {
    const autocompleteType = params.type as Parameters<
      typeof spellbookApi.autocomplete
    >[0];
    const options = await spellbookApi.autocomplete(autocompleteType, "");

    const items = await Promise.all(
      options.map((payload) => {
        return spellbookApi
          .search(formatSearch(payload.value, autocompleteType))
          .then((searchResults) => {
            const combos = searchResults.combos;

            return {
              text: payload.label,
              numberOfCombos: combos.length,
              ids: combos.map((c) => c.commanderSpellbookId),
            };
          });
      })
    );

    items.sort((a, b) => {
      if (a.numberOfCombos > b.numberOfCombos) {
        return 1;
      }
      if (b.numberOfCombos > a.numberOfCombos) {
        return -1;
      }

      return 0;
    });

    return {
      autocompleteType,
      items,
    };
  },
  data(): Data {
    return {
      autocompleteType: "",
      items: [],
    };
  },
  methods: {
    search(str: string): string {
      return formatSearch(str, this.autocompleteType);
    },
  },
});
</script>

<style>
/* styles here */
</style>
