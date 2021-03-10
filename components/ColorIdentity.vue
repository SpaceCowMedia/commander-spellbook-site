<template>
  <div class="w-full text-center">
    <p class="sr-only">Color Identity: {{ colorIdentityDescription }}</p>
    <!-- eslint-disable-next-line vue/require-v-for-key -->
    <img
      v-for="(url, index) in colorIdentitySymbolUrls"
      aria-hidden="true"
      class="color-identity"
      :class="size"
      :src="url"
      :alt="altTextFromIndex(index)"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import scryfall from "scryfall-client";

export default Vue.extend({
  props: {
    colors: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
    size: {
      type: String,
      default: "medium",
    },
  },
  computed: {
    colorIdentityDescription(): string {
      return this.colors.map((c) => this.colorNameFromSymbol(c)).join(", ");
    },
    colorIdentitySymbolUrls(): string[] {
      return this.colors.map((c) => scryfall.getSymbolUrl(c));
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
    altTextFromIndex(index: number): string {
      const colorId = this.colors[index].toLowerCase();
      const colorName = this.colorNameFromSymbol(colorId);

      if (!colorName) {
        return "Mana Symbol";
      }

      return `${colorName} Mana Symbol`;
    },
  },
});
</script>

<style scoped>
.color-identity {
  @apply m-2 inline-block;
}

.medium {
  @apply w-10;
}

.small {
  @apply w-8;
}
</style>
