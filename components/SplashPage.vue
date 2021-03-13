<template>
  <div
    class="w-full sm:pt-32 sm:pb-32 flex content-center justify-center text-center"
  >
    <div :class="{ 'animate-pulse': pulse }" class="mb-auto mt-auto p-10">
      <h3 class="heading-title">{{ title }}</h3>

      <ArtCircle
        class="m-auto mt-4 mb-4"
        :card-name="artCircleCardName"
        :artist="artCircleArtistName"
      />

      <slot />

      <div class="text-xs text-light w-1/2 m-auto">
        <i class="flavor-text">{{ flavor }}</i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ArtCircle from "@/components/ArtCircle.vue";

export default Vue.extend({
  components: {
    ArtCircle,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    flavor: {
      type: String,
      default: "",
    },
    artCircleCardName: {
      type: String,
      default: "",
    },
    artCircleArtistName: {
      type: String,
      default: "",
    },
    pulse: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style>
/* styles here */
</style>
