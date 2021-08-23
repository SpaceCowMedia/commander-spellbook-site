<template>
  <SplashPage
    title="Signing Out"
    flavor="What looked like a retreat was actually a replenishing."
    art-circle-card-name="Flowstone Flood"
    art-circle-artist-name="Paolo Parente"
  />
</template>

<script lang="ts">
import Vue from "vue";
import SplashPage from "@/components/SplashPage.vue";

export default Vue.extend({
  components: {
    SplashPage,
  },
  layout: "splash",

  mounted(): Promise<void> {
    return this.$store.dispatch("auth/signOut").then(() => {
      this.$router.replace({
        path: "/",
      });
    });
  },
});
</script>
