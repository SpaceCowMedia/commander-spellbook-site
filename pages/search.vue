<template>
  <div>
    <h1 class="sr-only">Search Results</h1>

    <SearchMessage
      :message="message"
      :errors="errors"
      :current-page="page"
      :total-pages="totalPages"
      :max-number-of-combos-per-page="maxNumberOfCombosPerPage"
      :total-results="totalResults"
    />

    <div v-if="paginatedResults.length > 0" class="border-b border-light">
      <div class="container sm:flex flex-row justify-center">
        <Select
          id="sort-combos-select"
          v-model="sort"
          class="my-2 sm:mr-2"
          select-background-class="border-dark border-2"
          select-text-class="text-dark"
          label="Sort Combos"
          :options="sortOptions"
        />
        <Select
          id="order-combos-select"
          v-model="order"
          class="sm:m-2"
          select-background-class="border-dark border-2"
          select-text-class="text-dark"
          label="Order Combos"
          :options="orderOptions"
        />
        <div class="flex-grow"></div>
        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          aria-hidden="true"
          @go-forward="goForward"
          @go-back="goBack"
        />
      </div>
    </div>

    <div class="container sm:flex flex-row">
      <div v-if="paginatedResults.length > 0" class="w-full">
        <ComboResults :results="paginatedResults" />

        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          @go-forward="goForward"
          @go-back="goBack"
        />
      </div>

      <NoCombosFound v-else :loaded="loaded && !redirecting" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ComboResults from "@/components/search/ComboResults.vue";
import NoCombosFound from "@/components/search/NoCombosFound.vue";
import Pagination from "@/components/search/Pagination.vue";
import SearchMessage from "@/components/search/SearchMessage.vue";
import Select, { Option } from "@/components/Select.vue";
import search from "@/lib/api/search";

import type { ComboResult } from "../components/search/ComboResults.vue";

type Data = {
  loaded: boolean;
  redirecting: boolean;
  page: number;
  maxNumberOfCombosPerPage: number;
  message: string;
  errors: string;
  combos: ComboResult[];
  sort: string;
  order: string;
};

export default Vue.extend({
  components: {
    ComboResults,
    NoCombosFound,
    Pagination,
    SearchMessage,
    Select,
  },
  data(): Data {
    return {
      loaded: false,
      redirecting: false,
      page: 1,
      maxNumberOfCombosPerPage: 78,
      message: "",
      errors: "",
      combos: [],
      sort: "colors",
      order: "ascending",
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
    sortOptions(): Option[] {
      return [
        { value: "colors", label: "Sort by color identity" },
        {
          value: "cards",
          label: "Sort by number of cards",
        },
        {
          value: "prerequisites",
          label: "Sort by number of prerequisites",
        },
        {
          value: "steps",
          label: "Sort by number of steps",
        },
        {
          value: "results",
          label: "Sort by number of results",
        },
      ];
    },

    orderOptions(): Option[] {
      return [
        { value: "ascending", label: "in ascending order" },
        { value: "descending", label: "in descending order" },
      ];
    },
  },
  watch: {
    "$route.query.q"(): void {
      this.onQueryChange();
    },
    "$route.query.page"(): void {
      this.updatePageFromQuery();
    },
    sort(): void {
      const query = String(this.$route.query.q)
        .replace(/((\s)?sort(:|=)\w*|$)/, ` sort:${this.sort}`)
        .trim();

      this.$router.push({
        path: this.$route.path,
        query: { q: query, page: "1" },
      });
    },
    order(): void {
      const query = String(this.$route.query.q)
        .replace(/((\s)?order(:|=)\w*|$)/, ` order:${this.order}`)
        .trim();

      this.$router.push({
        path: this.$route.path,
        query: { q: query, page: "1" },
      });
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

      const { message, sort, order, errors, combos } = await search(query);

      if (combos.length === 1) {
        this.redirecting = true;
        this.$router.replace({
          path: `/combo/${combos[0].commanderSpellbookId}`,
          query: { q: query },
        });
        return;
      }

      this.message = message;
      this.sort = sort;
      this.order = order;
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
