<template>
  <div class="combo-results-wrapper">
    <nuxt-link
      v-for="r in results"
      :key="'combo_' + r.id"
      :to="'/combo/' + r.id"
      class="combo-result w-full sm:w-1/3"
    >
      <div class="flex border-b-2 border-gray-300">
        <div class="flex-grow w-1/2">
          <div class="pl-3 pr-3 p-1 bg-gray-300 mb-2">
            <strong>Cards</strong>
          </div>
          <CardTooltip
            v-for="name in r.names"
            :key="r.id + '_' + name"
            :card-name="name"
          >
            <div class="card-name pl-3 pr-3">{{ name }}</div>
          </CardTooltip>
        </div>
        <div class="border-l-2 border-gray-300 flex-grow w-1/2">
          <div class="pl-3 pr-3 p-1 bg-gray-300 mb-2">
            <strong>Results</strong>
          </div>
          <!-- eslint-disable-next-line vue/require-v-for-key -->
          <div v-for="result in r.results" class="result pl-3 pr-3">
            {{ result }}
          </div>
        </div>
      </div>

      <div class="flex items-center h-full">
        <ColorIdentity :colors="r.colors" />
      </div>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export type ComboResult = {
  id: string
  names: string[]
  results: string[]
  colors: string[]
}

export default Vue.extend({
  props: {
    results: {
      type: Array as PropType<ComboResult[]>,
      default() {
        return []
      },
    },
  },
})
</script>

<style scoped>
.combo-results-wrapper {
  @apply flex flex-wrap;
}

.combo-result {
  @apply block m-4 rounded border-2 border-gray-300 flex-grow flex flex-col content-center;
}
</style>
