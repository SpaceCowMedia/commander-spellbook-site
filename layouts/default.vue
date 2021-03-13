<template>
  <div>
    <BetaMask>
      <a ref="skipLink" href="#main" class="sr-only">Skip to main content</a>
      <AnalyticsCookieBanner />
      <div class="bg-dark">
        <nav class="container">
          <SearchBar />
        </nav>
      </div>
      <main id="main" tabindex="-1" class="pb-16">
        <Nuxt />
      </main>
      <Footer class="mt-24 lg:mt-48 z-0" />
    </BetaMask>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AnalyticsCookieBanner from "@/components/AnalyticsCookieBanner.vue";
import BetaMask from "@/components/BetaMask.vue";
import SearchBar from "@/components/SearchBar.vue";
import Footer from "@/components/Footer.vue";

export default Vue.extend({
  components: {
    AnalyticsCookieBanner,
    SearchBar,
    BetaMask,
    Footer,
  },
  watch: {
    $route(): void {
      // @ts-ignore
      this.$refs.skipLink.focus();
    },
  },
});
</script>
