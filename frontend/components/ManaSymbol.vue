<template>
  <img class="mana-symbol" :class="size" :src="url" :alt="altText" />
</template>

<script lang="ts">
import Vue from "vue";
import scryfall from "scryfall-client";

export default Vue.extend({
  props: {
    symbol: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "medium",
    },
  },
  computed: {
    url(): string {
      return scryfall.getSymbolUrl(this.symbol);
    },
    altText(): string {
      const colorName = this.colorNameFromSymbol(this.symbol);

      if (!colorName) {
        return "Mana Symbol";
      }

      return `${colorName} Mana Symbol`;
    },
  },
  methods: {
    colorNameFromSymbol(id: string): string {
      switch (id) {
        case "w":
          return "White";
        case "u":
          return "Blue";
        case "b":
          return "Black";
        case "r":
          return "Red";
        case "g":
          return "Green";
        case "c":
          return "Colorless";
        default:
          return "";
      }
    },
  },
});
</script>

<style scoped>
.mana-symbol {
  @apply m-2 inline-block;
}

.medium {
  @apply w-10;
}

.small {
  @apply w-8;
}
</style>
