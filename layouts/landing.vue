<template>
  <div>
    <BetaMask>
      <AnalyticsCookieBanner />
      <main>
        <Nuxt />
      </main>
      <Footer />
    </BetaMask>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AnalyticsCookieBanner from "@/components/AnalyticsCookieBanner.vue";
import BetaMask from "@/components/BetaMask.vue";
import Footer from "@/components/Footer.vue";

export default Vue.extend({
  components: {
    AnalyticsCookieBanner,
    BetaMask,
    Footer,
  },
});
</script>
