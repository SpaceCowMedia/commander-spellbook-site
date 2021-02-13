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
import spellbookApi from "commander-spellbook";

export default Vue.extend({
  layout: "landing",

  async mounted(): Promise<void> {
    const randomCombo = await spellbookApi.random();

    this.$router.replace({
      path: `/combo/${randomCombo.commanderSpellbookId}`,
    });
  },
});
</script>
