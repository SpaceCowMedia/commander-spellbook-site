<template>
  <a :href="link" :target="target" @focus="$emit('focus')"><slot /></a>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    name: {
      type: String,
      default: "",
    },
    target: {
      type: String,
      default: "_blank",
    },
  },
  computed: {
    link(): string {
      let quotes = "%22";

      if (this.name.includes('"')) {
        quotes = "%27";
      }

      return `https://scryfall.com/search?q=name%3D${quotes}${encodeURIComponent(
        this.name
      )}${quotes}`;
    },
  },
});
</script>
