<template>
  <div>
    <a ref="skipLink" href="#main" class="sr-only">Skip to main content</a>
    <AnalyticsCookieBanner />
    <div class="bg-dark">
      <nav class="container">
        <SearchBar v-model="query" />
      </nav>
      <div class="gradient search-bar-border"></div>
    </div>
    <main id="main" tabindex="-1" class="pb-16">
      <Nuxt />
    </main>
    <Footer class="mt-24 lg:mt-48 z-0" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AnalyticsCookieBanner from "@/components/AnalyticsCookieBanner.vue";
import SearchBar from "@/components/SearchBar.vue";
import Footer from "@/components/Footer.vue";

export default Vue.extend({
  components: {
    AnalyticsCookieBanner,
    SearchBar,
    Footer,
  },
  data() {
    return {
      query: "",
    };
  },
  watch: {
    $route(): void {
      // @ts-ignore
      this.$refs.skipLink.focus();
    },
  },
});
</script>

<style scoped>
.search-bar-border {
  height: 2px;
}
</style>
