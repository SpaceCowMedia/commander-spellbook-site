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
    let query = this.$route.query.q;
    if (typeof query !== "string") {
      query = "";
    }
    const randomCombo = await random(query);
    const router = this.$router;
    const params: Parameters<typeof router.replace>[0] = {
      path: `/combo/${randomCombo.commanderSpellbookId}/`,
    };

    if (query) {
      params.query = { q: query };
    }

    router.replace(params);
  },
});
</script>
