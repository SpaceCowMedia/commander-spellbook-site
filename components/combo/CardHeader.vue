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
      <h1 class="heading-title combo-title">{{ title }}</h1>
      <h2 v-if="subtitle" class="heading-title combo-subtitle">
        {{ subtitle }}
      </h2>
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
    subtitle: {
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
  animation-name: color;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  @apply relative bg-primary w-full justify-center overflow-hidden;
}

.card-wrapper {
  @apply h-full flex-grow bg-top bg-cover;
}

.mask,
.combo-title-wrapper {
  @apply absolute top-0 bottom-0 left-0 right-0;
}

.mask {
  @apply bg-dark opacity-80;
}

.combo-title-wrapper {
  @apply flex flex-col justify-center content-center items-center text-center text-white;
}

.heading-title.combo-title,
.heading-title.combo-subtitle {
  @apply text-white text-xl -mt-2;
}

@media (min-width: 768px) {
  .heading-title.combo-title {
    @apply text-2xl;
  }
}

@media (min-width: 1024px) {
  .heading-title.combo-title {
    @apply text-3xl;
  }
}

@media (min-width: 1280px) {
  .heading-title.combo-title {
    @apply text-4xl;
  }
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
