<template>
  <!-- adapted from https://github.com/andersponders/vue-flip-card/blob/901c079a959f6e5cc0a0cb8b881e86ac1062e094/FlipCard.vue -->
  <div class="flip-container" :class="{ flipped }">
    <div class="flipper">
      <div class="front">
        <slot name="front"></slot>
      </div>
      <div class="back">
        <slot name="back"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    flipped: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped>
.flip-container {
  perspective: 1000;
}

.flipper {
  transform: perspective(1000px);
  transform-style: preserve-3d;
  @apply relative;
}

.front,
.back {
  backface-visibility: hidden;
  transition: 0.6s;
  transform-style: preserve-3d;
  @apply relative w-full top-0 left-0;
}

.back {
  transform: rotateY(-180deg);
  @apply absolute;
}

.flip-container.flipped .back {
  transform: rotateY(0deg);
}

.flip-container.flipped .front {
  transform: rotateY(180deg);
}
</style>
