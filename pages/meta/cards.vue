<template>
  <div class="container py-4">
    <p class="p-2 my-2">
      This is a list of every card in the combo database with the number of
      combos they are in and direct links to the combos as long as the number of
      combos that contain the card is less than 6.
    </p>
    <p v-for="(card, index) in cards" :key="index" class="p-2 my-1">
      <TextWithMagicSymbol :text="card.text" />
      -
      <nuxt-link :to="{ path: '/search', query: { q: search(card.text) } }">
        {{ card.numberOfCombos }} combo<span v-if="card.numberOfCombos > 1"
          >s</span
        >
      </nuxt-link>
      <span v-if="card.numberOfCombos < 6">
        (
        <span v-for="(id, comboIndex) in card.ids" :key="card.text + '-' + id">
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
  cards: { text: string; numberOfCombos: number; ids: string[] }[];
};

function formatSearch(card: string): string {
  let quotes = "'";

  if (card.includes("'")) {
    quotes = '"';
  }

  return `include:banned card=${quotes}${card}${quotes}`;
}

export default Vue.extend({
  components: {
    TextWithMagicSymbol,
  },
  async asyncData() {
    const options = await spellbookApi.autocomplete("cards", "");

    const cards = await Promise.all(
      options.map((card) => {
        return spellbookApi.search(formatSearch(card.value)).then((payload) => {
          const combos = payload.combos;

          return {
            text: card.label,
            numberOfCombos: combos.length,
            ids: combos.map((c) => c.commanderSpellbookId),
          };
        });
      })
    );

    cards.sort((a, b) => {
      if (a.numberOfCombos > b.numberOfCombos) {
        return 1;
      }
      if (b.numberOfCombos > a.numberOfCombos) {
        return -1;
      }

      return 0;
    });

    return {
      cards,
    };
  },
  data(): Data {
    return {
      cards: [],
    };
  },
  methods: {
    search(card: string): string {
      return formatSearch(card);
    },
  },
});
</script>

<style>
/* styles here */
</style>
