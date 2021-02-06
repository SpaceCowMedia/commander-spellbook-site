<template>
  <div class="outer-container">
    <form class="main-search-input-container h-full" @submit.prevent="onSubmit">
      <nuxt-link v-if="includeLinks" to="/" class="block mr-2 flex-shrink py-1">
        <ArtCircle :size="2" card-name="Spellbook" artist="Ciruelo" />
      </nuxt-link>
      <input
        v-model="query"
        type="text"
        class="main-search-input flex-grow"
        name="q"
        :class="inputClass"
        :placeholder="`Search ${numberOfCombos} combos`"
      />
      <div v-if="includeLinks" class="flex flex-shrink flex-row items-center">
        <nuxt-link
          to="/advanced-search"
          class="flex flex-row items-center px-4 border-l border-r border-gray-400"
        >
          <img :src="advancedSearchIcon" class="link-icon" />
          <span>Advanced</span>
        </nuxt-link>
        <nuxt-link
          to="/syntax-guide"
          class="flex items-center flex-row pl-4 pr-2"
        >
          <img :src="syntaxGuideIcon" class="link-icon" /> <span>Syntax</span>
        </nuxt-link>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import spellbookApi from "commander-spellbook";

export default Vue.extend({
  props: {
    includeLinks: {
      type: Boolean,
      default: true,
    },
    inputClass: {
      type: String,
      default: "pl-2 text-lg",
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
  watch: {
    "$route.query.q"(): void {
      this.setQueryFromUrl();
    },
  },
  mounted() {
    this.setQueryFromUrl();
  },
  computed: {
    advancedSearchIcon(): string {
      return require("~/assets/svgs/columns-solid.svg");
    },
    syntaxGuideIcon(): string {
      return require("~/assets/svgs/question-solid.svg");
    },
  },
  methods: {
    async lookupNumberOfCombos(): Promise<void> {
      const combos = await spellbookApi.getAllCombos();

      this.numberOfCombos = String(combos.length);
    },
    setQueryFromUrl() {
      const query = this.$route.query.q;

      if (typeof query === "string") {
        this.query = query;
      } else {
        this.query = "";
      }
    },
    onSubmit(): void {
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
.outer-container {
  @apply bg-gray-200 border border-gray-200 mx-auto;
}

.main-search-input-container {
  @apply flex m-auto;
}

.main-search-input {
  @apply appearance-none block bg-gray-200 text-gray-700 py-2 leading-tight;
}

.main-search-input:focus {
  @apply outline-none bg-white border-gray-500;
}

.link-icon {
  @apply h-4 mr-2;
}
</style>
