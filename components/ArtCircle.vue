<template>
  <div
    class="rounded-full bg-gray-400 bg-center bg-cover"
    :class="computedClass"
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
    setCode: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 64,
    },
  },
  computed: {
    computedClass(): string {
      return `h-${this.size} w-${this.size}`;
    },
    computedStyle(): Record<string, string> {
      return {
        backgroundImage: `url('${this.imgSrc}')`,
      };
    },
    credit(): string {
      return `${this.cardName} by ${this.artist}`;
    },
    imgSrc(): string {
      let url = `https://api.scryfall.com/cards/named?exact=${this.cardName}&format=image&version=art_crop`;

      if (this.setCode) {
        url += `&set=${this.setCode}`;
      }

      return url;
    },
  },
});
</script>

<style scoped>
/* TODO */
</style>
