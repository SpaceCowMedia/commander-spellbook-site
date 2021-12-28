<template>
  <div class="my-4">
    <label :for="id">{{ label }}</label>
    <div>
      <input
        v-model="localState"
        type="text"
        class="input"
        :id="id"
        :disabled="disabled"
      />
    </div>
    <span class="helper-text">{{ helperText }}</span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    id: {
      type: String,
      default: "",
    },
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
    disabled: {
      type: Boolean,
      default: false,
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

<style scoped>
label {
  @apply font-bold;
}

.input {
  @apply max-w-md;
}

.helper-text {
  @apply text-gray-500 text-sm;
}
</style>
