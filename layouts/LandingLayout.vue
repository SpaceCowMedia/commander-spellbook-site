<template>
  <div class="gradient">
    <AnalyticsCookieBanner />
    <main>
      <Nuxt />
    </main>
    <PageFooter />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AnalyticsCookieBanner from "@/components/AnalyticsCookieBanner.vue";
import PageFooter from "@/components/PageFooter.vue";

export default Vue.extend({
  components: {
    AnalyticsCookieBanner,
    PageFooter,
  },
});
</script>
