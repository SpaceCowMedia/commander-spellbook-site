<template>
  <ExternalLink :to="link" @focus="$emit('focus')"><slot /></ExternalLink>
</template>

<script lang="ts">
import Vue from "vue";
import ExternalLink from "@/components/ExternalLink.vue";

export default Vue.extend({
  components: {
    ExternalLink,
  },
  props: {
    name: {
      type: String,
      default: "",
    },
  },
  computed: {
    link(): string {
      let quotes = "%22";

      if (this.name.includes('"')) {
        quotes = "%27";
      }

      return `https://scryfall.com/search?q=%21${quotes}${encodeURIComponent(
        this.name
      )}${quotes}`;
    },
  },
});
</script>
