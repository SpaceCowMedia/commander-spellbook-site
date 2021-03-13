<template>
  <header class="hidden sm:flex header">
    <div class="flex w-full h-64">
      <div
        v-for="(art, index) in cardsArt"
        :key="'card-header-image-' + index"
        class="card-wrapper"
        :style="background(art)"
      ></div>
    </div>
    <div class="mask"></div>
    <div class="combo-title-wrapper">
      <h1 class="combo-title">{{ title }}</h1>
    </div>
  </header>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
  props: {
    title: {
      type: String,
      default: "",
    },
    cardsArt: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
  },
  methods: {
    background(url: string) {
      return `background-image: url("${url}")`;
    },
  },
});
</script>

<style scoped>
.header {
  position: relative;
  background: #222;
  overflow: hidden;
  animation-name: color;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  @apply w-full justify-center;
}

.card-wrapper {
  background-size: cover;
  background-position: center;
  @apply h-full flex-grow;
}

.mask,
.combo-title-wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.mask {
  background: black;
  opacity: 0.65;
}

.combo-title-wrapper {
  font-family: monospace;
  font-weight: 300;
  font-size: 50px;
  @apply flex justify-center content-center items-center text-center text-white;
}

@keyframes color {
  0% {
    @apply bg-dark;
  }
  50% {
    @apply bg-primary;
  }
  100% {
    @apply bg-dark;
  }
}
</style>
