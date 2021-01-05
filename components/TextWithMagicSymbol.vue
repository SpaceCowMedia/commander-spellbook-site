<template>
  <span>
    <!-- eslint-disable-next-line vue/require-v-for-key -->
    <span v-for="item in items">
      <img
        v-if="item.nodeType === 'image'"
        class="magic-symbol"
        :src="item.value"
      />
      <CardTooltip v-else-if="item.nodeType === 'card'" :card-name="item.value">
        <span>{{ item.value }}</span>
      </CardTooltip>
      <span v-else class="text">{{ item.value }}</span>
    </span>
  </span>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import scryfall from "scryfall-client";

type NodeConfig = {
  nodeType: "image" | "card" | "text";
  value: string;
};

export default Vue.extend({
  props: {
    cardsInCombo: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
    text: {
      type: String,
      default: "",
    },
  },
  computed: {
    items(): NodeConfig[] {
      let matchableValuesString = this.cardsInCombo.join("|");

      if (matchableValuesString) {
        matchableValuesString += "|";
      }

      matchableValuesString = `(${matchableValuesString}:mana[^:]+:)`;

      const matchableValuesRegex = new RegExp(matchableValuesString, "g");

      return this.text
        .split(matchableValuesRegex)
        .filter((val) => val)
        .map((value) => {
          if (this.cardsInCombo.includes(value.trim())) {
            return {
              nodeType: "card",
              value,
            };
          }
          const manaMatch = value.match(/:mana([^:]+):/);

          if (manaMatch) {
            const manaSymbol = manaMatch[1];

            return {
              nodeType: "image",
              value: scryfall.getSymbolUrl(manaSymbol),
            };
          }

          return {
            nodeType: "text",
            value,
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
