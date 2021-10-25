<template>
  <div class="my-4">
    <label>{{ label }}</label>
    <div>
      <input v-model="localState" type="text" class="input" />
    </div>
    <span class="helper-text">{{ helperText }}</span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    label: {
      type: String,
      default: "",
    },
    helperText: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
  },
  computed: {
    localState: {
      get(): string {
        return this.value;
      },
      set(localState: string): void {
        this.$emit("input", localState);
      },
    },
  },
});
</script>
