<template>
  <div class="gradient">
    <AnalyticsCookieBanner />
    <main>
      <Nuxt />
    </main>
    <Footer />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AnalyticsCookieBanner from "@/components/AnalyticsCookieBanner.vue";
import Footer from "@/components/Footer.vue";

export default Vue.extend({
  components: {
    AnalyticsCookieBanner,
    Footer,
  },
});
</script>
