<template>
  <form class="main-search-input-container" @submit.prevent="onSubmit">
    <input
      v-model="query"
      type="text"
      class="main-search-input"
      :class="inputClass"
      :placeholder="`Search ${numberOfCombos} combos`"
    />
  </form>
</template>

<script lang="ts">
import Vue from "vue";
import spellbookApi from "commander-spellbook";

export default Vue.extend({
  props: {
    inputClass: {
      type: String,
      default: "text-lg",
    },
  },
  data() {
    return {
      query: "",
      numberOfCombos: "....",
    };
  },
  async fetch() {
    await this.lookupNumberOfCombos();
  },
  mounted() {
    const query = this.$route.query.q;

    if (typeof query === "string") {
      this.query = query;
    }
  },
  methods: {
    async lookupNumberOfCombos() {
      const combos = await spellbookApi.getAllCombos();

      this.numberOfCombos = String(combos.length);
    },
    onSubmit() {
      if (!this.query.trim()) {
        return;
      }

      this.$router.push({
        path: "/search",
        query: {
          q: this.query,
        },
      });
    },
  },
});
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
