<template>
  <footer class="footer">
    <div class="container md:flex flex-row text-center md:text-left">
      <div class="link-collection">
        <nuxt-link to="/advanced-search">Advanced Search</nuxt-link>
        <nuxt-link to="/syntax-guide">Syntax Guide</nuxt-link>
        <nuxt-link to="/random">Random Combo</nuxt-link>
      </div>
      <div class="link-collection">
        <nuxt-link to="/about">About</nuxt-link>
        <nuxt-link to="/metrics">Combo Metrics</nuxt-link>
        <nuxt-link to="/how-to-submit-a-combo">Combo Submission</nuxt-link>
        <nuxt-link to="/privacy-policy">Privacy Policy</nuxt-link>
      </div>
      <div class="link-collection">
        <a href="https://www.patreon.com/commanderspellbook" target="_blank"
          >Patreon</a
        >
        <a href="https://discord.gg/DkAyVJG" target="_blank">Discord</a>
        <a href="https://twitter.com/CommanderSpell" target="_blank">Twitter</a>
        <a href="https://github.com/Commander-Spellbook" target="_blank"
          >Github</a
        >
      </div>
    </div>
    <div class="container mt-8 text-gray-400">
      <p class="my-4">
        Commander Spellbook may use the trademarks and other intellectual
        property of Wizards of the Coast LLC, which is permitted under Wizards'
        Fan Site Policy. For more information, please visit their website at
        <a href="https://company.wizards.com/">https://company.wizards.com/</a>.
      </p>
      <p class="my-4">
        Commander Spellbook utilizes icons provided by
        <a href="https://fontawesome.com/" target="_blank"> Font Awesome</a>.
        Licensing information may be found here:
        <a href="https://fontawesome.com/license" target="_blank">
          https://fontawesome.com/license</a
        >.
      </p>
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
  @apply w-full bg-primary p-10;
}

.footer a {
  @apply text-white no-underline;
}

.link-collection {
  @apply flex flex-grow flex-col;
}
</style>
