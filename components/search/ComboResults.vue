<template>
  <div class="combo-results-wrapper">
    <nuxt-link
      v-for="r in results"
      ref="comboLinks"
      :key="'combo_' + r.commanderSpellbookId"
      :to="'/combo/' + r.commanderSpellbookId + '/'"
      class="combo-result w-full md:w-1/4"
    >
      <div class="flex flex-col">
        <div class="flex items-center flex-grow flex-col bg-dark text-white">
          <ColorIdentity :colors="r.colorIdentity.colors" size="small" />
        </div>
        <div class="flex-grow border-b-2 border-light">
          <div class="py-1">
            <span class="sr-only">Cards in combo:</span>
            <CardTooltip
              v-for="name in r.cards.names()"
              :key="r.commanderSpellbookId + '_' + name"
              :card-name="name"
            >
              <div class="card-name pl-3 pr-3">
                {{ name }}
              </div>
            </CardTooltip>
          </div>
        </div>
        <div class="flex-grow">
          <span class="sr-only">Results in combo:</span>
          <!-- eslint-disable-next-line vue/require-v-for-key -->
          <div v-for="result in r.results" class="result pl-3 pr-3">
            <TextWithMagicSymbol :text="result" />
          </div>
        </div>
      </div>
      <div class="flex items-center flex-grow flex-col">
        <div class="flex-grow"></div>
        <div
          v-if="sortStatMessage(r)"
          class="
            sort-footer
            w-full
            py-1
            text-center
            flex-shrink
            bg-dark
            text-white
          "
        >
          {{ sortStatMessage(r) }}
        </div>
      </div>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import CardTooltip from "@/components/CardTooltip.vue";
import TextWithMagicSymbol from "@/components/TextWithMagicSymbol.vue";
import ColorIdentity from "@/components/ColorIdentity.vue";
import { DEFAULT_VENDOR } from "@/lib/constants";
import type {
  FormattedApiResponse,
  SortValue,
  VendorValue,
} from "@/lib/api/types";

export default Vue.extend({
  components: {
    CardTooltip,
    ColorIdentity,
    TextWithMagicSymbol,
  },
  props: {
    sort: {
      type: String as PropType<SortValue>,
      default: "",
    },
    vendor: {
      type: String as PropType<VendorValue>,
      default: DEFAULT_VENDOR,
    },
    results: {
      type: Array as PropType<FormattedApiResponse[]>,
      default() {
        return [];
      },
    },
  },
  methods: {
    sortStatMessage(combo: FormattedApiResponse): string {
      if (!this.sort) {
        return "";
      }

      if (this.sort === "popularity") {
        if (!combo.numberOfEDHRECDecks) {
          return "No deck data (EDHREC)";
        }

        if (combo.numberOfEDHRECDecks === 1) {
          return "1 deck (EDHREC)";
        }

        return `${combo.numberOfEDHRECDecks} decks (EDHREC)`;
      }

      if (this.sort === "price") {
        const vendor = this.vendor as VendorValue;

        if (combo.cards.getPrice(vendor) === 0) {
          return "Price Unavailable";
        }
        return `$${combo.cards.getPriceAsString(vendor)}`;
      }

      switch (this.sort) {
        case "prerequisites":
        case "steps":
        case "results":
        case "cards":
          if (combo[this.sort].length === 1) {
            // remove the s in the sort word
            return `1 ${this.sort.slice(0, -1)}`;
          }
          return `${combo[this.sort].length} ${this.sort}`;
      }

      return "";
    },
  },
});
</script>

<style scoped>
a {
  @apply no-underline text-dark;
}

.combo-results-wrapper {
  @apply flex flex-wrap justify-center;
}

.combo-result {
  @apply max-w-lg mx-0 my-2 rounded border-2 border-dark flex-grow flex flex-col content-center;
}

@media (min-width: 768px) {
  .combo-result {
    @apply m-2;
  }

  .combo-result:nth-child(3n + 3) {
    @apply mr-0;
  }

  .combo-result:nth-child(3n + 1) {
    @apply ml-0;
  }
}
</style>
