<template>
  <a
    :href="href"
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
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    href(): void | string {
      if (this.disabled) {
        return;
      }
      return this.to;
    },
  },
});
</script>
