<template>
  <div class="outer-container">
    <form class="main-search-input-container h-full" @submit.prevent="onSubmit">
      <nuxt-link v-if="includeLinks" to="/" class="block mr-2 flex-shrink py-1">
        <ArtCircle :size="2" card-name="Spellbook" artist="Ciruelo" />
      </nuxt-link>

      <div class="flex flex-grow items-center">
        <div
          v-if="includeLinks"
          class="search-input-icon"
          @click="focusSearch"
        ></div>
        <input
          v-model="query"
          type="text"
          class="main-search-input"
          :class="inputClasses"
          name="q"
          ref="searchInput"
          :placeholder="`Search ${numberOfCombos} combos`"
        />
      </div>
      <div v-if="includeLinks" class="flex flex-shrink flex-row items-center">
        <button
          id="search-bar-menu-button"
          type="button"
          @click="toggleMenu"
          class="sm:hidden flex flex-row items-center rounded bg-gray-300 py-1 px-2 border border-gray-400 text-gray-700"
        >
          <div class="menu-icon link-icon"></div>
          Menu
        </button>
        <nuxt-link
          to="/advanced-search"
          class="hidden sm:flex flex-row items-center px-4 border-l border-r border-gray-400 text-gray-700"
        >
          <div class="advanced-search-icon link-icon"></div>
          Advanced
        </nuxt-link>
        <nuxt-link
          to="/syntax-guide"
          class="hidden sm:flex items-center flex-row pl-4 pr-2 text-gray-700"
        >
          <div class="syntax-guide-icon link-icon"></div>
          Syntax
        </nuxt-link>
      </div>
    </form>
    <div
      v-if="includeLinks && showMobileMenu"
      @click="toggleMenu"
      class="sm:hidden flex flex-row text-center mt-2 mb-4 pt-4 border-t border-gray-400 text-gray-700"
    >
      <nuxt-link
        to="/advanced-search"
        class="rounded bg-gray-300 flex flex-row w-1/2 flex-grow items-center py-1 px-2 border border-gray-400 mr-4"
      >
        <div class="advanced-search-icon link-icon"></div>
        Advanced Search
      </nuxt-link>
      <nuxt-link
        to="/syntax-guide"
        class="rounded bg-gray-300 flex items-center flex-row w-1/2 flex-grow py-1 px-2 border border-gray-400 ml-4"
      >
        <div class="syntax-guide-icon link-icon"></div>
        Syntax Guide
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
    inputClasses(): string {
      let classes = "";

      if (this.includeLinks) {
        classes += " pl-8 -ml-6";
      }
      if (this.inputClass) {
        classes += ` ${this.inputClass}`;
      }

      return classes;
    },
  },
  methods: {
    focusSearch(): void {
      (this.$refs.searchInput as HTMLInputElement).focus();
    },
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
  @apply w-full h-full appearance-none block py-2 bg-gray-200 text-gray-700 leading-tight;
}

.main-search-input:focus {
  @apply outline-none bg-white border-gray-500;
}

.link-icon {
  @apply bg-gray-700 h-4 w-4 mr-2;
}

.menu-icon {
  -webkit-mask: url("~assets/svgs/bars-solid.svg") no-repeat center;
  mask: url("~assets/svgs/bars-solid.svg") no-repeat center;
}

.advanced-search-icon {
  -webkit-mask: url("~assets/svgs/columns-solid.svg") no-repeat center;
  mask: url("~assets/svgs/columns-solid.svg") no-repeat center;
}
.syntax-guide-icon {
  -webkit-mask: url("~assets/svgs/question-solid.svg") no-repeat center;
  mask: url("~assets/svgs/question-solid.svg") no-repeat center;
}
.search-input-icon {
  -webkit-mask: url("~assets/svgs/search-solid.svg") no-repeat center;
  mask: url("~assets/svgs/search-solid.svg") no-repeat center;
  @apply bg-gray-700 w-4 h-4 mt-1 z-10 cursor-pointer;
}
.search-input-icon:hover {
  @apply bg-gray-800;
}
</style>
