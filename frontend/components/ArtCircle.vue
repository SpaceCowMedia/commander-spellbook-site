<template>
  <div
    class="art-circle"
    :style="computedStyle"
    :title="customTitle"
    aria-hidden="true"
  ></div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    cardName: {
      type: String,
      default: "",
    },
    artist: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 16,
    },
    title: {
      type: String,
      default: "",
    },
  },
  computed: {
    computedStyle(): Record<string, string> {
      return {
        backgroundImage: `url(${this.imgSrc})`,
        height: `${this.size}rem`,
        width: `${this.size}rem`,
      };
    },
    credit(): string {
      return `${this.cardName} by ${this.artist}`;
    },
    customTitle(): string {
      return this.title ? this.title : this.credit;
    },
    imgSrc(): string {
      let quotes = "'";

      if (this.cardName.includes("'")) {
        quotes = '"';
      }

      return (
        quotes +
        require(`~/assets/images/art-circles/${this.cardName}-${this.artist}.jpg`) +
        quotes
      );
    },
  },
});
</script>

<style scoped>
.art-circle {
  image-rendering: crisp-edges;
  @apply rounded-full bg-light bg-center bg-cover;
}
</style>
