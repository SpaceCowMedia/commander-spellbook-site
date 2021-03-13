<template>
  <div>
    <BetaMask>
      <AnalyticsCookieBanner />
      <div class="bg-dark">
        <nav class="container">
          <SearchBar />
        </nav>
      </div>
      <main>
        <Nuxt />
      </main>
      <Footer class="mt-48" />
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
});
</script>
