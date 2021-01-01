<template>
  <div
    class="rounded-full bg-gray-400 bg-center bg-cover"
    :style="computedStyle"
    :title="credit"
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
  },
  computed: {
    computedStyle(): Record<string, string> {
      return {
        backgroundImage: `url('${this.imgSrc}')`,
        height: `${this.size}rem`,
        width: `${this.size}rem`,
      };
    },
    credit(): string {
      return `${this.cardName} by ${this.artist}`;
    },
    imgSrc(): string {
      return require(`~/assets/images/art-circles/${this.cardName}-${this.artist}.jpg`);
    },
  },
});
</script>

<style scoped>
/* TODO */
</style>
