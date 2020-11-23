<template>
  <div>
    <SearchBar @new-query="updateSearchResults" />

    <div class="container max-w-5xl mx-auto sm:flex flex-row">
      <div v-if="loaded">
        <ComboResults v-if="results.length > 0" :results="results" />
        <NoCombosFound v-else />
      </div>

      <LoadingCombos v-else />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import spellbookApi from 'commander-spellbook'

import type { ComboResult } from '../components/search/ComboResults.vue'

type Data = {
  loaded: boolean
  results: ComboResult[]
}

export default Vue.extend({
  async fetch() {
    await this.parseSearchQuery()
  },
  data(): Data {
    return {
      loaded: false,
      results: [],
    }
  },
  methods: {
    async updateSearchResults(query: string) {
      this.results = []

      const combos = await spellbookApi.search(query)

      this.results.push(
        ...combos.map((c) => {
          return {
            names: c.cards.join(', '),
            id: String(c.commanderSpellbookId),
          }
        })
      )
    },
    async parseSearchQuery() {
      const query = this.$route.query.q

      if (!query || typeof query !== 'string') {
        this.loaded = true
        return
      }

      await this.updateSearchResults(query)

      this.loaded = true
    },
  },
})
</script>

<style scoped>
/* Styles here */
</style>
