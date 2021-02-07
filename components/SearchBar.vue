<template>
  <div class="outer-container">
    <form class="main-search-input-container" @submit.prevent="onSubmit">
      <nuxt-link v-if="!onHomePage" to="/" class="block mr-2 flex-shrink py-1">
        <div class="sr-only">Go to Home Page</div>
        <ArtCircle
          title="Commander Spellbook Logo (art Spellbook by Ciruelo)"
          :size="2"
          card-name="Spellbook"
          artist="Ciruelo"
        />
      </nuxt-link>

      <div class="flex flex-grow items-center">
        <div
          v-if="!onHomePage"
          class="search-input-icon"
          aria-hidden="true"
          @click="focusSearch"
        ></div>
        <label aria-hidden="true" for="search-bar-input" class="sr-only"
          >Combo Search</label
        >
        <input
          ref="searchInput"
          id="search-bar-input"
          v-model="query"
          type="text"
          class="main-search-input"
          :class="inputClasses"
          name="q"
          :placeholder="`Search ${numberOfCombos} combos`"
        />
      </div>
      <div v-if="!onHomePage" class="flex flex-shrink flex-row items-center">
        <button
          id="search-bar-menu-button"
          type="button"
          class="mobile-menu-button"
          @click="toggleMenu"
        >
          <div class="menu-icon link-icon" aria-hidden="true"></div>
          Menu
        </button>
        <nuxt-link to="/advanced-search" class="hidden sm:flex menu-link">
          <div class="advanced-search-icon link-icon" aria-hidden="true"></div>
          Advanced
        </nuxt-link>
        <nuxt-link to="/syntax-guide" class="hidden sm:flex menu-link">
          <div class="syntax-guide-icon link-icon" aria-hidden="true"></div>
          Syntax
        </nuxt-link>
      </div>
    </form>
    <div
      v-if="!onHomePage && showMobileMenu"
      class="sm:hidden flex flex-row text-center mt-2 mb-4 pt-4 border-t border-gray-400 text-gray-700"
      @click="toggleMenu"
    >
      <nuxt-link to="/advanced-search" class="mobile-menu-button">
        <div class="advanced-search-icon link-icon" aria-hidden="true"></div>
        Advanced Search
      </nuxt-link>
      <nuxt-link to="/syntax-guide" class="mobile-menu-button">
        <div class="syntax-guide-icon link-icon" aria-hidden="true"></div>
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
    onHomePage: {
      type: Boolean,
      default: false,
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
  computed: {
    inputClasses(): string {
      if (this.onHomePage) {
        return "text-2xl text-center";
      }
      return "pl-8 -ml-6";
    },
  },
  watch: {
    "$route.query.q"(): void {
      this.setQueryFromUrl();
    },
  },
  mounted() {
    this.setQueryFromUrl();
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
  @apply flex m-auto h-full;
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

.menu-link {
  @apply items-center flex-row px-4 pr-2 text-gray-700 border-l border-gray-400;
}

.menu-link:last-of-type {
  @apply pr-0;
}

.menu-link:hover {
  @apply text-gray-800;
}

.menu-link:hover .link-icon {
  @apply bg-gray-800;
}

.mobile-menu-button {
  @apply flex flex-row flex-grow items-center w-1/2 rounded bg-gray-300 py-1 px-2 border border-gray-400 mx-2;
}

.mobile-menu-button:hover {
  @apply border-gray-500 text-gray-800;
}

.mobile-menu-button:hover .link-icon {
  @apply bg-gray-800;
}

.mobile-menu-button:nth-child(even),
.mobile-menu-button:last-of-type {
  @apply mr-0;
}
.mobile-menu-button:nth-child(odd) {
  @apply ml-0;
}

@media (min-width: 640px) {
  #search-bar-menu-button {
    @apply hidden;
  }
}
</style>
