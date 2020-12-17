<template>
  <div>
    <SearchBar @new-query="updateSearchResults" />

    <div class="container max-w-5xl mx-auto sm:flex flex-row">
      <div v-if="loaded">
        <div v-if="paginatedResults.length > 0">
          <Pagination
            :page-size="maxNumberOfCombosPerPage"
            :current-page="page"
            :total-pages="totalPages"
            :total-results="totalResults"
            @go-forward="goForward"
            @go-back="goBack"
          />

          <ComboResults :results="paginatedResults" />

          <Pagination
            :page-size="maxNumberOfCombosPerPage"
            :current-page="page"
            :total-pages="totalPages"
            :total-results="totalResults"
            @go-forward="goForward"
            @go-back="goBack"
          />
        </div>

        <NoCombosFound v-else />
      </div>

      <LoadingCombos v-else />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import spellbookApi from "commander-spellbook";

import type { ComboResult } from "../components/search/ComboResults.vue";

type Data = {
  loaded: boolean;
  page: number;
  maxNumberOfCombosPerPage: number;
  combos: ComboResult[];
};

export default Vue.extend({
  data(): Data {
    return {
      loaded: false,
      page: 1,
      maxNumberOfCombosPerPage: 76,
      combos: [],
    };
  },
  async fetch() {
    await this.parseSearchQuery();
  },
  computed: {
    totalResults(): number {
      return this.combos.length;
    },
    totalPages(): number {
      return Math.floor(this.totalResults / this.maxNumberOfCombosPerPage) + 1;
    },
    startingPoint(): number {
      let startingPoint = (this.page - 1) * this.maxNumberOfCombosPerPage;

      if (startingPoint > this.totalResults) {
        startingPoint = (this.totalPages - 1) * this.maxNumberOfCombosPerPage;
      }

      return startingPoint;
    },
    paginatedResults(): ComboResult[] {
      let results = this.combos;

      if (this.totalResults > this.maxNumberOfCombosPerPage) {
        results = results.slice(
          this.startingPoint,
          this.startingPoint + this.maxNumberOfCombosPerPage
        );
      }

      return results;
    },
  },
  methods: {
    async updateSearchResults(query: string): Promise<void> {
      this.combos = [];
      this.page = 1;
      this.$router.push({
        path: this.$route.path,
        query: { q: query },
      });

      const combos = await spellbookApi.search(query);

      if (combos.length === 1) {
        this.$router.push({
          path: `/combo/${combos[0].commanderSpellbookId}`,
          query: { q: query },
        });
        return;
      }

      this.combos = combos.map((c) => {
        return {
          names: c.cards.map((card) => card.name),
          colors: Array.from(c.colorIdentity.colors),
          results: Array.from(c.results),
          id: String(c.commanderSpellbookId),
        };
      });
    },
    async parseSearchQuery() {
      const query = this.$route.query.q;

      this.page = Number(this.$route.query.page) || 1;

      if (!query || typeof query !== "string") {
        this.loaded = true;
        return;
      }

      await this.updateSearchResults(query);

      this.loaded = true;
    },
    navigateToPage(pagesToChange: number): void {
      this.page = this.page + pagesToChange;
      this.$router.push({
        path: this.$route.path,
        query: { q: this.$route.query.q, page: String(this.page) },
      });
      window.scrollTo(0, 0);
    },
    goForward(): void {
      this.navigateToPage(1);
    },
    goBack(): void {
      this.navigateToPage(-1);
    },
  },
});
</script>

<style scoped>
/* Styles here */
</style>
