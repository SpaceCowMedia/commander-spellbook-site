<template>
  <div class="outer-container">
    <form
      class="main-search-input-container container h-full"
      @submit.prevent="onSubmit"
    >
      <nuxt-link
        v-if="includeLogo"
        to="/"
        class="block mr-2 flex-grow py-1 px-2 border-r border-l border-gray-400"
      >
        <ArtCircle :size="2" card-name="Spellbook" artist="Ciruelo" />
      </nuxt-link>
      <input
        v-model="query"
        type="text"
        class="main-search-input"
        name="q"
        :class="inputClass"
        :placeholder="`Search ${numberOfCombos} combos`"
      />
    </form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import spellbookApi from "commander-spellbook";

export default Vue.extend({
  props: {
    includeLogo: {
      type: Boolean,
      default: true,
    },
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
    async lookupNumberOfCombos(): Promise<void> {
      const combos = await spellbookApi.getAllCombos();

      this.numberOfCombos = String(combos.length);
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
  @apply appearance-none block h-full bg-gray-200 text-gray-700 py-2 leading-tight w-full;
}

.main-search-input:focus {
  @apply outline-none bg-white border-gray-500;
}
</style>
