<template>
  <div class="text-white w-full bg-center bg-cover" :class="containerClass">
    <div
      class="bg-black bg-opacity-75 w-full h-screen flex flex-col items-center justify-center text-center"
    >
      <h1 class="hero-title">{{ mainMessage }}</h1>
      <h2 class="hero-subtitle">{{ subMessage }}</h2>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    containerClass: {
      type: String,
      default: "",
    },
    mainMessage: {
      type: String,
      default: "",
    },
    subMessage: {
      type: String,
      default: "",
    },
  },
});
</script>

<style scoped>
.hero-title,
.hero-subtitle,
.helper-text {
  animation: 3s appear;
}

.hero-title {
  font-family: monospace;
  font-size: 100px;
  @apply font-light;
}

.hero-subtitle {
  @apply font-light text-4xl mt-5 mb-5;
}

@keyframes appear {
  0% {
    opacity: 0;
  }
}
</style>
