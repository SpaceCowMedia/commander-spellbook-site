<template>
  <div>
    <SearchMessage
      :message="message"
      :errors="errors"
      :current-page="page"
      :total-pages="totalPages"
      :max-number-of-combos-per-page="maxNumberOfCombosPerPage"
      :total-results="totalResults"
    />

    <div class="container sm:flex flex-row">
      <div v-if="paginatedResults.length > 0">
        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          @go-forward="goForward"
          @go-back="goBack"
        />

        <ComboResults :results="paginatedResults" />

        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          @go-forward="goForward"
          @go-back="goBack"
        />
      </div>

      <NoCombosFound v-else :loaded="loaded" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ComboResults from "@/components/search/ComboResults.vue";
import NoCombosFound from "@/components/search/NoCombosFound.vue";
import Pagination from "@/components/search/Pagination.vue";
import SearchMessage from "@/components/search/SearchMessage.vue";
import spellbookApi from "commander-spellbook";

import type { ComboResult } from "../components/search/ComboResults.vue";

type Data = {
  loaded: boolean;
  page: number;
  maxNumberOfCombosPerPage: number;
  message: string;
  errors: string;
  combos: ComboResult[];
};

export default Vue.extend({
  components: {
    ComboResults,
    NoCombosFound,
    Pagination,
    SearchMessage,
  },
  data(): Data {
    return {
      loaded: false,
      page: 1,
      maxNumberOfCombosPerPage: 76,
      message: "",
      errors: "",
      combos: [],
    };
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
    firstResult(): number {
      return (
        this.page * this.maxNumberOfCombosPerPage -
        this.maxNumberOfCombosPerPage +
        1
      );
    },
    lastResult(): number {
      const finalResult = this.firstResult + this.maxNumberOfCombosPerPage - 1;

      if (finalResult > this.totalResults) {
        return this.totalResults;
      }

      return finalResult;
    },
  },
  watch: {
    "$route.query.q"(): void {
      this.onQueryChange();
    },
    "$route.query.page"(): void {
      this.updatePageFromQuery();
    },
  },
  async mounted(): Promise<void> {
    await this.onQueryChange();
  },
  methods: {
    async onQueryChange(): Promise<void> {
      this.loaded = false;

      const query = this.parseSearchQuery();
      this.updatePageFromQuery();

      if (!query) {
        this.loaded = true;
        return;
      }

      await this.updateSearchResults(query);

      this.loaded = true;
    },
    updatePageFromQuery(): void {
      this.page = Number(this.$route.query.page) || 1;
    },
    async updateSearchResults(query: string): Promise<void> {
      this.combos = [];
      this.message = "";
      this.errors = "";
      this.page = 1;
      this.$router.push({
        path: this.$route.path,
        query: { q: query },
      });

      const { message, errors, combos } = await spellbookApi.search(query);

      if (combos.length === 1) {
        this.$router.replace({
          path: `/combo/${combos[0].commanderSpellbookId}`,
          query: { q: query },
        });
        return;
      }

      this.message = message;
      this.errors = errors.map((e) => e.message).join(" ");
      this.combos = combos.map((c) => {
        return {
          names: c.cards.map((card) => card.name),
          colors: Array.from(c.colorIdentity.colors),
          results: Array.from(c.results),
          id: String(c.commanderSpellbookId),
        };
      });
    },
    parseSearchQuery(): string {
      const query = this.$route.query.q;

      if (!query || typeof query !== "string") {
        return "";
      }

      return query;
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
