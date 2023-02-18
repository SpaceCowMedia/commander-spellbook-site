<template>
  <div class="static-page">
    <ArtCircle
      card-name="Kethis the Hidden Hand"
      artist="Yongjae Choi"
      class="m-auto md:block hidden"
    />
    <h1 class="heading-title">Want to submit a combo?</h1>
    <p>
      At this time, combo submissions (and updates) are only being accepted via
      <ExternalLink to="https://discord.gg/KDnvP5f">Discord</ExternalLink>, as
      we've learned from experience that many of them require a discussion. If
      your combo isn't listed here, or if you've found a bug with one of our
      combos, please join us on Discord to contribute to the catalog.
    </p>
    <div class="text-center">
      <ExternalLink role="button" class="button" to="https://discord.gg/KDnvP5f"
        >Join us on Discord</ExternalLink
      >
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ArtCircle from "@/components/ArtCircle.vue";
import ExternalLink from "@/components/ExternalLink.vue";

export default Vue.extend({
  components: {
    ArtCircle,
    ExternalLink,
  },
  head() {
    return {
      title: "Commander Spellbook: How to Submit a Combo",
    };
  },
});
</script>
