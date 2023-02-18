<template>
  <div class="static-page">
    <ArtCircle
      card-name="Go Blank"
      artist="Wylie Beckert"
      class="m-auto md:block hidden"
    />
    <h1 class="heading-title">Report an Error</h1>
    <p>
      The first step for reporting an error is
      <ExternalLink to="https://discord.gg/KDnvP5f"
        >joining our Discord server</ExternalLink
      >. Once you have joined, copy and fill the following template to report an
      error in the
      <ExternalLink
        to="https://discord.com/channels/673601282946236417/673734250402545676"
        >#submit-an-update
      </ExternalLink>
      channel:
    </p>

    <pre id="error-template"><code>Combo Link: {{ link }}
Problem with Combo:
</code></pre>

    <div class="text-center">
      <ExternalLink
        role="button"
        class="button"
        to="https://discord.com/channels/673601282946236417/673734250402545676"
        >Report the Error in #submit-an-update
      </ExternalLink>
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
  data() {
    return {
      id: "",
    };
  },
  head() {
    return {
      title: "Commander Spellbook: Report Error",
    };
  },
  computed: {
    link(): string {
      if (!this.id) {
        return "";
      }
      return `https://commanderspellbook.com/combo/${this.id}`;
    },
  },
  mounted(): void {
    const id = this.$route.query.comboId;

    if (typeof id !== "string") {
      return;
    }
    this.id = id;
  },
});
</script>

<style scoped>
pre {
  @apply my-4 bg-gray-200 p-4 overflow-x-auto;
}
</style>
