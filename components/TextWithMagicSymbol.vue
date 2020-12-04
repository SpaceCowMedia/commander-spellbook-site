<template>
  <span>
    <!-- eslint-disable-next-line vue/require-v-for-key -->
    <span v-for="item in items">
      <img
        v-if="item.type === 'image'"
        class="magic-symbol"
        :src="item.value"
      />
      <span v-else class="text">{{ item.value }}</span>
    </span>
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import scryfall from "scryfall-client";

type Item = {
  type: string;
  value: string;
};

export default Vue.extend({
  props: {
    text: {
      type: String,
      default: "",
    },
  },
  computed: {
    items() {
      return this.text
        .split(/(:mana[^:]+:)/g)
        .filter((val) => val)
        .map((val) => {
          const match = val.match(/:mana([^:]+):/);

          if (match) {
            const manaSymbol = match[1];

            return {
              type: "image",
              value: scryfall.getSymbolUrl(manaSymbol),
            };
          }

          return {
            type: "text",
            value: val,
          };
        });
    },
  },
});
</script>

<style scoped>
img.magic-symbol {
  /* match the font-size of the text around it */
  height: 1em;

  /* adjust the position so it fits more naturally with the text around it */
  margin-top: -0.3em;
  @apply inline;
}
</style>
