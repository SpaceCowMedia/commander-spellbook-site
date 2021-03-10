<template>
  <footer class="footer">
    <div class="container md:flex flex-row">
      <div class="flex-grow">
        <nuxt-link to="/syntax-guide"> Syntax Guide </nuxt-link>
      </div>
      <div class="flex-grow">
        <nuxt-link to="/about"> About </nuxt-link>
        <nuxt-link to="/metrics"> Combo Metrics </nuxt-link>
        <nuxt-link to="/how-to-submit-a-combo"> Combo Submission </nuxt-link>
        <nuxt-link to="/fan-site-policy"> Fan Site Policy </nuxt-link>
        <nuxt-link tp="/privacy-policy"> Privacy Policy </nuxt-link>
        <nuxt-link to="/syntax-guide"> Syntax Guide </nuxt-link>
      </div>
    </div>
    <AnalyticsCookieBanner />
  </footer>
</template>

<script lang="ts">
import Vue from "vue";
import AnalyticsCookieBanner from "@/components/AnalyticsCookieBanner.vue";

export default Vue.extend({
  components: {
    AnalyticsCookieBanner,
  },
});
</script>

<style scoped>
.footer {
  /* ensures that the cookie banner does not fully cover up footer
    may not need this once the links are fully created */
  min-height: 300px;
  @apply w-full h-10 bg-primary p-10 text-center;
}

.footer a {
  @apply text-white no-underline;
}
</style>
