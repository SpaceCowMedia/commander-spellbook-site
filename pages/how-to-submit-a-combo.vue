<template>
  <div class="static-page">
    <ArtCircle
      card-name="beetleback chief"
      artist="Wayne England"
      class="m-auto md:block hidden"
    />
    <h1 class="heading-title">Want to submit a combo?</h1>
    <p>
      At this time, combo submissions (and updates) are only being accepted via
      <a target="_blank" href="https://discord.gg/KDnvP5f">Discord</a>, as we've
      learned from experience that many of them require a discussion. If your
      combo isn't listed here, or if you've found a bug with one of our combos,
      please join us on Discord to contribute to the catalog.
    </p>
    <div class="text-center">
      <a
        role="button"
        class="button"
        target="_blank"
        href="https://discord.gg/KDnvP5f"
        >Join us on Discord</a
      >
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ArtCircle from "@/components/ArtCircle.vue";

export default Vue.extend({
  components: {
    ArtCircle,
  },
});
</script>
