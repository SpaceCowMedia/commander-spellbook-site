<template>
  <div class="main-search-input-container">
    <input
      v-model="query"
      type="text"
      class="main-search-input"
      :class="inputClass"
      :placeholder="'Search ' + numberOfCombos + ' combos'"
      @keydown.enter="onEnter"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import spellbookApi from 'commander-spellbook'

export default Vue.extend({
  props: {
    inputClass: {
      type: String,
      default: 'text-lg',
    },
  },
  async fetch() {
    await this.lookupNumberOfCombos()
  },
  data() {
    return {
      query: '',
      numberOfCombos: '....',
    }
  },
  mounted() {
    const query = this.$route.query.q

    if (typeof query === 'string') {
      this.query = query
    }
  },
  methods: {
    async lookupNumberOfCombos() {
      const combos = await spellbookApi.search()
      this.numberOfCombos = String(combos.length)
    },
    onEnter() {
      if (!this.query.trim()) {
        return
      }

      if (this.$route.path === '/search') {
        this.$emit('new-query', this.query)
      } else {
        this.$router.push(`/search?q=${this.query}`)
      }
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
