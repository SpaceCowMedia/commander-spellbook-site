<template>
  <div class="combo-results-wrapper">
    <nuxt-link
      v-for="r in results"
      :key="'combo_' + r.id"
      :to="'/combo/' + r.id"
      class="combo-result w-full md:w-1/4"
    >
      <div class="flex flex-col">
        <div class="flex items-center flex-grow">
          <ColorIdentity :colors="r.colors" size="8" />
        </div>
        <div class="flex-grow border-t-2 border-b-2 border-gray-300">
          <div class="py-1">
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
          <!-- eslint-disable-next-line vue/require-v-for-key -->
          <div v-for="result in r.results" class="result pl-3 pr-3">
            {{ result }}
          </div>
        </div>
      </div>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import CardTooltip from "@/components/CardTooltip.vue";
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
  @apply flex flex-wrap;
}

.combo-result {
  @apply block m-2 rounded border-2 border-gray-300 flex-grow flex flex-col content-center;
}

.combo-result:nth-child(3n + 3) {
  @apply mr-0;
}

.combo-result:nth-child(3n + 1) {
  @apply ml-0;
}

@media (min-width: 640px) {
  .combo-result:nth-child(3n + 3) {
    @apply mr-2;
  }

  .combo-result:nth-child(3n + 1) {
    @apply ml-2;
  }
}
</style>
