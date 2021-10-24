<template>
  <div class="border-gray-400 border rounded-sm">
    <h2 class="p-4 border-b border-gray-400 bg-gray-100">{{ title }}</h2>
    <div class="p-4">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    title: {
      type: String,
      default: "",
    },
  },
});
</script>
