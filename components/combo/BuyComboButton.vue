<template>
  <a
    :id="vendor + '-buy-this-combo'"
    :href="link"
    target="_blank"
    class="button w-full"
  >
    {{ label }}
  </a>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
  props: {
    vendor: {
      type: String,
      default: "tcgplayer", // or cardkingdom
    },
    cards: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
  },
  computed: {
    link(): string {
      switch (this.vendor) {
        case "cardkingdom":
          return this.cardkingdomLink;
        case "tcgplayer":
          return this.tcgPlayerLink;
        default:
      }
      return "";
    },
    cardsWithQuantities(): string[] {
      return this.cards.map((name) => {
        return `1 ${name}`;
      });
    },
    cardkingdomLink(): string {
      const cardQuery = encodeURI(this.cardsWithQuantities.join("\n"));

      // TODO some of these query params will change to identify the source as commander spellbook
      return `https://www.cardkingdom.com/builder?partner=edhrec&utm_source=edhrec&utm_medium=clipboard&utm_campaign=edhrec&c=${cardQuery}`;
    },
    tcgPlayerLink(): string {
      const cardQuery = encodeURI(this.cardsWithQuantities.join("||"));

      // TODO some of these query params will change to identify the source as commander spellbook
      return `https://www.tcgplayer.com/massentry?partner=EDHREC&utm_campaign=affiliate&utm_medium=clipboard&utm_source=EDHREC&c=${cardQuery}`;
    },
    label(): string {
      const prefix = "Buy this Combo at ";

      switch (this.vendor) {
        case "tcgplayer":
          return prefix + "TCGPlayer";
        case "cardkingdom":
          return prefix + "Card Kingdom";
        default:
      }

      return "";
    },
  },
});
</script>

<style scoped>
/* TODO */
</style>
