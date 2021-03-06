<template>
  <div class="container py-4">
    <p class="p-2 my-2">
      This is a list of every color in the combo database with the number of
      combos they are in, sorted by number of combos from fewest to most.
    </p>
    <p v-for="(color, index) in colors" :key="index" class="p-2 my-1">
      <TextWithMagicSymbol :text="color.text" />
      -
      <nuxt-link :to="{ path: 'search', query: { q: search(color.text) } }">
        {{ color.numberOfCombos }} combo<span v-if="color.numberOfCombos > 1"
          >s</span
        >
      </nuxt-link>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import TextWithMagicSymbol from "@/components/TextWithMagicSymbol.vue";
import spellbookApi from "commander-spellbook";

type Data = {
  colors: { text: string; numberOfCombos: number; ids: string[] }[];
};

function formatSearch(color: string): string {
  let quotes = "'";

  if (color.includes("'")) {
    quotes = '"';
  }

  return `include:banned colors=${quotes}${color}${quotes}`;
}

export default Vue.extend({
  components: {
    TextWithMagicSymbol,
  },
  async asyncData() {
    const options = await spellbookApi.autocomplete("colors", "");

    const colors = await Promise.all(
      options.map((color) => {
        return spellbookApi
          .search(formatSearch(color.value))
          .then((payload) => {
            const combos = payload.combos;

            return {
              text: color.label,
              numberOfCombos: combos.length,
              ids: combos.map((c) => c.commanderSpellbookId),
            };
          });
      })
    );

    colors.sort((a, b) => {
      if (a.numberOfCombos > b.numberOfCombos) {
        return 1;
      }
      if (b.numberOfCombos > a.numberOfCombos) {
        return -1;
      }

      return 0;
    });

    return {
      colors,
    };
  },
  data(): Data {
    return {
      colors: [],
    };
  },
  methods: {
    search(color: string): string {
      return formatSearch(color);
    },
  },
});
</script>

<style>
/* styles here */
</style>
