<template>
  <div class="main-search-input-container">
    <input
      type="text"
      class="main-search-input"
      :class="inputClass"
      :placeholder="'Search ' + numberOfCombos + ' combos'"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import spellbookApi from 'commander-spellbook'

export default Vue.extend({
  async fetch() {
    await this.lookupNumberOfCombos()
  },
  props: {
    inputClass: {
      type: String,
      default: 'text-lg',
    },
  },
  data() {
    return {
      numberOfCombos: 'x',
    }
  },
  methods: {
    async lookupNumberOfCombos() {
      const combos = await spellbookApi.search()
      this.numberOfCombos = String(combos.length)
    },
  },
})
</script>

<style scoped>
.main-search-input-container {
  @apply bg-gray-200 flex m-auto;
}

.main-search-input {
  @apply appearance-none block h-12 bg-gray-200 text-gray-700 border border-gray-200 py-2 px-4 leading-tight m-auto w-full max-w-5xl;
}

.main-search-input:focus {
  @apply outline-none bg-white border-gray-500;
}
</style>
