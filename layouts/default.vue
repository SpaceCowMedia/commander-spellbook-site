<template>
  <div>
    <a ref="skipLink" href="#main" class="sr-only">Skip to main content</a>
    <AnalyticsCookieBanner />
    <div class="bg-dark">
      <nav class="container">
        <SearchBar />
      </nav>
      <div class="gradient search-bar-border"></div>
    </div>
    <main id="main" tabindex="-1" class="pb-16">
      <Nuxt />
    </main>
    <PageFooter class="mt-24 lg:mt-48 z-0" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AnalyticsCookieBanner from "@/components/AnalyticsCookieBanner.vue";
import SearchBar from "@/components/SearchBar.vue";
import PageFooter from "@/components/PageFooter.vue";

export default Vue.extend({
  // got to give it a multi-word name to appease
  // the eslint rules, but it should still get used
  // correctly by nuxt based on the filename
  name: "DefaultLayout",
  components: {
    AnalyticsCookieBanner,
    SearchBar,
    PageFooter,
  },
  watch: {
    $route(): void {
      (this.$refs.skipLink as HTMLAnchorElement).focus();
    },
  },
});
</script>

<style scoped>
.search-bar-border {
  height: 2px;
}
</style>
