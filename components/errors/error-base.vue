<template>
  <div class="text-white w-full bg-center bg-cover" :class="containerClass">
    <div
      class="bg-dark bg-opacity-75 w-full h-screen flex flex-col items-center justify-center text-center pb-16"
    >
      <h1 class="heading-title hero-title">{{ mainMessage }}</h1>
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
.hero-subtitle {
  animation: 3s appear;
}

.hero-title {
  @apply text-white;
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
