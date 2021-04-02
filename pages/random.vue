<template>
  <SplashPage
    title="Randomizing"
    flavor="Ever try to count hyperactive schoolchildren while someone shouts random numbers in your ear? It’s like that."
    art-circle-card-name="Chaosphere"
    art-circle-artist-name="Steve Luke"
  />
</template>

<script lang="ts">
import Vue from "vue";
import SplashPage from "@/components/SplashPage.vue";
import random from "@/lib/api/random";

export default Vue.extend({
  components: {
    SplashPage,
  },
  layout: "splash",

  async mounted(): Promise<void> {
    const randomCombo = await random();

    this.$router.replace({
      path: `/combo/${randomCombo.commanderSpellbookId}/`,
    });
  },
});
</script>
