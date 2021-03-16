<template>
  <div class="combo-results-wrapper">
    <nuxt-link
      v-for="r in results"
      ref="comboLinks"
      :key="'combo_' + r.id"
      :to="'/combo/' + r.id"
      class="combo-result w-full md:w-1/4"
    >
      <div class="flex flex-col">
        <div class="flex items-center flex-grow bg-dark text-white">
          <ColorIdentity :colors="r.colors" size="small" />
        </div>
        <div class="flex-grow border-b-2 border-light">
          <div class="py-1">
            <span class="sr-only">Cards in combo:</span>
            <CardTooltip
              v-for="name in r.names"
              :key="r.id + '_' + name"
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
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import CardTooltip from "@/components/CardTooltip.vue";
import TextWithMagicSymbol from "@/components/TextWithMagicSymbol.vue";
import ColorIdentity from "@/components/ColorIdentity.vue";

export type ComboResult = {
  id: string;
  names: string[];
  results: string[];
  colors: string[];
};

export default Vue.extend({
  components: {
    CardTooltip,
    ColorIdentity,
    TextWithMagicSymbol,
  },
  props: {
    results: {
      type: Array as PropType<ComboResult[]>,
      default() {
        return [];
      },
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
