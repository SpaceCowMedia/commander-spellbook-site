<template>
  <a
    :href="to"
    :target="target"
    rel="noopener"
    @click="$emit('click')"
    @focus="$emit('focus')"
    ><slot
  /></a>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    to: {
      type: String,
      default: "",
    },
    target: {
      type: String,
      default: "_blank",
    },
  },
});
</script>
