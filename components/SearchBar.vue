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
        <button
          id="search-bar-menu-button"
          type="button"
          @click="toggleMenu"
          class="sm:hidden flex flex-row items-center rounded bg-gray-300 py-1 px-2 border border-gray-400"
        >
          <img :src="menuIcon" class="link-icon" /> Menu
        </button>
        <nuxt-link
          to="/advanced-search"
          class="hidden sm:flex flex-row items-center px-4 border-l border-r border-gray-400"
        >
          <img :src="advancedSearchIcon" class="link-icon" />
          Advanced
        </nuxt-link>
        <nuxt-link
          to="/syntax-guide"
          class="hidden sm:flex items-center flex-row pl-4 pr-2"
        >
          <img :src="syntaxGuideIcon" class="link-icon" /> Syntax
        </nuxt-link>
      </div>
    </form>
    <div
      v-if="includeLinks && showMobileMenu"
      @click="toggleMenu"
      class="sm:hidden flex flex-row text-center mt-2 mb-4 pt-4 border-t border-gray-400"
    >
      <nuxt-link
        to="/advanced-search"
        class="rounded bg-gray-300 flex flex-row w-1/2 flex-grow items-center py-1 px-2 border border-gray-400 mr-4"
      >
        <img :src="advancedSearchIcon" class="link-icon" />
        Advanced
      </nuxt-link>
      <nuxt-link
        to="/syntax-guide"
        class="rounded bg-gray-300 flex items-center flex-row w-1/2 flex-grow py-1 px-2 border border-gray-400 ml-4"
      >
        <img :src="syntaxGuideIcon" class="link-icon" /> Syntax
      </nuxt-link>
    </div>
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
      showMobileMenu: false,
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
    menuIcon(): string {
      return require("~/assets/svgs/bars-solid.svg");
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
    setQueryFromUrl(): void {
      const query = this.$route.query.q;

      if (typeof query === "string") {
        this.query = query;
      } else {
        this.query = "";
      }
    },
    toggleMenu(): void {
      this.showMobileMenu = !this.showMobileMenu;
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
