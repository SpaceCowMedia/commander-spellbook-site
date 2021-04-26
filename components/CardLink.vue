<template>
  <ExternalLink :to="link" @focus="$emit('focus')"><slot /></ExternalLink>
</template>

<script lang="ts">
import Vue from "vue";
import ExternalLink from "@/components/ExternalLink.vue";
import Card from "@/lib/api/models/card";

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
  data() {
    return {
      card: new Card(this.name),
    };
  },
  computed: {
    link(): string {
      const edhrecLink = this.card.getEdhrecLink();

      if (edhrecLink) {
        return edhrecLink;
      }

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
