<template>
  <div>
    <a ref="skipLink" href="#main" class="sr-only">Skip to main content</a>
    <AnalyticsCookieBanner />
    <div class="bg-dark fixed top-0 left-0 right-0">
      <nav class="container">
        <SearchBar />
      </nav>
    </div>
    <main
      id="main"
      tabindex="-1"
      class="
        gradient
        h-screen
        pt-16
        md:pt-0 md:flex
        flex-col
        content-center
        justify-center
      "
    >
      <div
        class="
          w-min
          bg-white
          p-2
          md:p-8
          rounded
          shadow-xl
          w-auto
          mx-auto
          md:my-4
        "
      >
        <Nuxt />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AnalyticsCookieBanner from "@/components/AnalyticsCookieBanner.vue";
import SearchBar from "@/components/SearchBar.vue";

export default Vue.extend({
  components: {
    AnalyticsCookieBanner,
    SearchBar,
  },
  watch: {
    $route(): void {
      (this.$refs.skipLink as HTMLAnchorElement).focus();
    },
  },
});
</script>
