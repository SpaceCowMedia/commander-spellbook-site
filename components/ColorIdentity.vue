<template>
  <div class="w-full text-center">
    <!-- eslint-disable-next-line vue/require-v-for-key -->
    <img
      v-for="(url, index) in colorIdentitySymbolUrls"
      class="color-identity"
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
  },
  computed: {
    colorIdentitySymbolUrls(): string[] {
      return this.colors.map((c) => scryfall.getSymbolUrl(c));
    },
  },
  methods: {
    altTextFromIndex(index: number): string {
      const color = this.colors[index].toLowerCase();

      switch (color) {
        case "w":
          return "White Mana Symbol";
        case "u":
          return "Blue Mana Symbol";
        case "b":
          return "Black Mana Symbol";
        case "r":
          return "Red Mana Symbol";
        case "g":
          return "Green Mana Symbol";
        case "c":
          return "Colorless Mana Symbol";
        default:
          return "Mana Symbol";
      }
    },
  },
});
</script>

<style scoped>
.color-identity {
  @apply m-2 inline-block w-10;
}
</style>
