<template>
  <button
    v-if="hasSimiliarCombos"
    id="has-similiar-combos"
    class="button w-full"
    @click="goToSimiliarCombos"
  >
    {{ text }}
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
      numberOfSimiliarCombos: 0,
    };
  },
  async fetch() {
    await this.lookupSimiliarCombos();
  },
  computed: {
    text(): string {
      if (this.numberOfSimiliarCombos === 1) {
        return "View Another Combo Using these Cards";
      }
      return `Find ${this.numberOfSimiliarCombos} Other Combos Using These Cards`;
    },
    hasSimiliarCombos(): boolean {
      return this.numberOfSimiliarCombos > 0;
    },
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

      this.numberOfSimiliarCombos = result.combos.length;
    },
    goToSimiliarCombos(): void {
      this.$gtag.event("Combos Using These Cards Button Clicked", {
        event_category: "Combo Detail Page Actions",
      });

      this.$router.push({
        path: "/search/",
        query: {
          q: this.similiarSearchString,
        },
      });
    },
  },
});
</script>
