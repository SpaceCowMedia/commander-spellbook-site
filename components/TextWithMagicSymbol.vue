<template>
  <span>
    <!-- eslint-disable-next-line vue/require-v-for-key -->
    <span v-for="item in items" :class="item.nodeType + '-container'">
      <span v-if="item.nodeType === 'image'">
        <span class="sr-only">
          ({{ item.manaSymbol }} magic symbol) &nbsp; </span
        ><img
          aria-hidden="true"
          class="magic-symbol"
          :src="item.value"
          :alt="'Magic Symbol (' + item.manaSymbol + ')'"
        />
      </span>
      <CardTooltip
        v-else-if="item.nodeType === 'card'"
        :card-name="item.cardName"
      >
        <CardLink v-if="includeCardLinks" :name="item.cardName">{{
          item.value
        }}</CardLink>
        <span v-else>{{ item.value }}</span></CardTooltip
      ><span v-else class="text">{{ item.value }}</span>
    </span>
  </span>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import CardLink from "@/components/CardLink.vue";
import CardTooltip from "@/components/CardTooltip.vue";
import scryfall from "scryfall-client";

type NodeConfig = {
  nodeType: "image" | "card" | "text";
  cardName?: string;
  value: string;
};

export default Vue.extend({
  components: {
    CardLink,
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
      let matchableValuesString = "";

      if (this.cardsInCombo.length > 0) {
        matchableValuesString = `${this.cardsInCombo.join("|")}|`;

        if (this.cardShortNames.length > 0) {
          matchableValuesString += `${this.cardShortNames.join("|")}|`;
        }
      }

      matchableValuesString = `(${matchableValuesString}:mana[^:]+:|{[^}]+})`;

      const matchableValuesRegex = new RegExp(matchableValuesString, "g");

      return this.text
        .split(matchableValuesRegex)
        .filter((val) => val)
        .map((value) => {
          if (this.cardsInCombo.includes(value.trim())) {
            return {
              nodeType: "card",
              cardName: value,
              value,
            };
          } else if (this.cardShortNames.includes(value.trim())) {
            const fullName = this.cardsInCombo.find((card) =>
              card.includes(value.trim())
            );

            if (fullName) {
              return {
                nodeType: "card",
                cardName: fullName,
                value,
              };
            }
          }
          const manaMatch = value.match(/:mana([^:]+):|{([^}]+)}/);

          if (manaMatch) {
            const manaSymbol = (manaMatch[1] || manaMatch[2]).replace("/", "");

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
    cardShortNames(): string[] {
      return this.cardsInCombo.reduce((list, name) => {
        if (name.match(/^[^,]+,/)) {
          list.push(name.split(",")[0]);
        } else if (name.match(/^[^\s]+\s(the|of)\s/i)) {
          list.push(name.split(/\s(the|of)/i)[0]);
        } else if (name.includes(" // ")) {
          list.push(...name.split(" // "));
        } else if (name.match(/^the\s/i)) {
          const restOfName = name.split(/^the\s/i)[1];

          list.push(restOfName);
          list.push(restOfName.split(" ")[0]);
        }

        return list;
      }, [] as string[]);
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
  margin-top: -0.2em;
  @apply inline;
}

.image-container + .image-container {
  @apply ml-1;
}
</style>
