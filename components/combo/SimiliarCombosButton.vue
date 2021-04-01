<template>
  <button
    v-if="hasSimiliarCombos"
    id="has-similiar-combos"
    class="button w-full"
    @click="goToSimiliarCombos"
  >
    Find Other Combos Using These Cards
  </button>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import search from "@/lib/api/search";

export default Vue.extend({
  props: {
    cards: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
    comboId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      hasSimiliarCombos: false,
    };
  },
  async fetch() {
    await this.lookupSimiliarCombos();
  },
  computed: {
    similiarSearchString(): string {
      return this.cards.reduce((accum, name) => {
        let quotes = '"';

        if (name.includes('"')) {
          quotes = "'";
        }

        return accum + ` card=${quotes}${name}${quotes}`;
      }, `-spellbookid:${this.comboId}`);
    },
  },
  methods: {
    async lookupSimiliarCombos(): Promise<void> {
      const result = await search(this.similiarSearchString);

      this.hasSimiliarCombos = result.combos.length > 0;
    },
    goToSimiliarCombos(): void {
      this.$gtag.event("Combos Using These Cards Button Clicked", {
        event_category: "Combo Detail Page Actions",
      });

      this.$router.push({
        path: "/search",
        query: {
          q: this.similiarSearchString,
        },
      });
    },
  },
});
</script>
