<template>
  <span class="placeholder-text">
    <div class="text-bar" :style="style"></div>
  </span>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    maxLength: {
      type: Number,
      default: 90,
    },
    minLength: {
      type: Number,
      default: 10,
    },
  },

  data() {
    return {
      length: 0,
    };
  },

  computed: {
    style(): string {
      return `width: ${this.length}%`;
    },
  },

  mounted() {
    this.length = Math.floor(Math.random() * this.maxLength) + this.minLength;
  },
});
</script>

<style scoped>
.placedholder-text {
  @apply inline-block w-full;
}

.text-bar {
  height: 0.8em;
  margin-top: 0.2em;
  animation-name: color;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  @apply bg-light rounded inline-block;
}

@keyframes color {
  0% {
    @apply bg-gray-300;
  }
  50% {
    @apply bg-gray-400;
  }
  100% {
    @apply bg-gray-300;
  }
}
</style>
