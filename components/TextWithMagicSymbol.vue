<template>
  <Fragment>
    <!-- eslint-disable-next-line vue/require-v-for-key -->
    <span v-for="item in items">
      <Fragment v-if="item.nodeType === 'image'">
        <img
          aria-hidden="true"
          class="magic-symbol"
          :src="item.value"
          :alt="'Magic Symbol (' + item.manaSymbol + ')'"
        />
        <span class="sr-only">
          ({{ item.manaSymbol }} magic symbol) &nbsp;
        </span>
      </Fragment>
      <CardTooltip v-else-if="item.nodeType === 'card'" :card-name="item.value">
        <a
          v-if="includeCardLinks"
          :href="getLinkFromCardName(item.value)"
          target="_blank"
          >{{ item.value }}</a
        >
        <Fragment v-else>{{ item.value }}</Fragment></CardTooltip
      ><span v-else class="text">{{ item.value }}</span>
    </span>
  </Fragment>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import { Fragment } from "vue-fragment";
import CardTooltip from "@/components/CardTooltip.vue";
import scryfall from "scryfall-client";

type NodeConfig = {
  nodeType: "image" | "card" | "text";
  value: string;
};

export default Vue.extend({
  components: {
    Fragment,
    CardTooltip,
  },
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
    includeCardLinks: {
      type: Boolean,
      default: false,
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
              manaSymbol,
            };
          }

          return {
            nodeType: "text",
            value,
          };
        });
    },
  },
  methods: {
    getLinkFromCardName(cardName: string): string {
      let quotes = "%22";

      if (cardName.includes('"')) {
        quotes = "%27";
      }

      return `https://scryfall.com/search?q=name%3D${quotes}${encodeURIComponent(
        cardName
      )}${quotes}`;
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
