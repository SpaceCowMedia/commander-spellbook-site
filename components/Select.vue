<template>
  <div
    class="rounded-l-sm relative"
    :class="{ 'bg-primary': !error, 'bg-danger': error }"
  >
    <label :for="id" class="sr-only text-white" aria-hidden="true">{{
      label
    }}</label>
    <select
      :id="id"
      v-model="localState"
      class="operator-selector focus:shadow-outline"
    >
      <option
        v-for="(option, index) in options"
        :key="`${label}-input-${index}-${option.label}`"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <div
      class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
    >
      <svg class="w-4 h-4 fill-current text-white" viewBox="0 0 20 20">
        <path
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
          fill-rule="evenodd"
        ></path>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export type Option = { value: string; label: string };

export default Vue.extend({
  props: {
    label: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    options: {
      type: Array as PropType<Option[]>,
      default() {
        return [];
      },
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
.operator-selector {
  @apply w-full h-10 pl-3 pr-6 text-base text-white appearance-none bg-transparent;
}
</style>
