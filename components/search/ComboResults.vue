<template>
  <div class="combo-results">
    <div v-for="r in results" :key="'combo-' + r.id" class="combo-result">
      <nuxt-link :to="'/combo/' + r.id">{{ r.names }}</nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export type ComboResult = {
  id: string
  names: string
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
/* todo */
</style>
