<template>
  <div>
    <div
      class="
        flex
        items-center
        font-medium
        tracking-wide
        text-red-500 text-xs
        mt-1
        ml-1
        error-message
      "
      role="alert"
      v-if="message"
    >
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    message: {
      type: String,
      default: "",
    },
  },
});
</script>
