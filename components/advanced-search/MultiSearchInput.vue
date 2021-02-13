<template>
  <div>
    <div class="w-full md:w-1/3 flex-grow my-2 md:my-0">
      <span class="input-label">{{ inputLabel }}</span>
    </div>
    <div
      v-for="(input, index) in inputs"
      :key="`${label}-input-${index}`"
      class="my-2"
      :class="'input-wrapper-' + index"
    >
      <div class="flex">
        <div
          class="w-1/2 relative rounded-l-sm"
          :class="{ 'bg-blue-800': !input.error, 'bg-red-700': input.error }"
        >
          <select
            v-model="input.operator"
            class="operator-selector focus:shadow-outline"
            :class="{
              ['select-' + index]: true,
            }"
          >
            <option
              v-for="option in operatorOptions"
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

        <div class="w-full flex-grow flex flex-row">
          <input
            v-model="input.value"
            class="input"
            :class="{
              ['input-' + index]: true,
              'border-blue-800': !input.error,
              'border-red-700': input.error,
            }"
            type="text"
            :placeholder="getPlaceholder(input.operator)"
          />

          <button
            v-if="inputs.length > 1"
            type="button"
            class="minus-button input-button"
            :class="{
              ['minus-button-' + index]: true,
              'bg-blue-800': !input.error,
              'bg-red-700': input.error,
            }"
            @click.prevent="removeInput(index)"
          >
            −
          </button>
          <button
            type="button"
            class="plus-button input-button rounded-r-sm"
            :class="{
              ['plus-button-' + index]: true,
              'bg-blue-800': !input.error,
              'bg-red-700': input.error,
            }"
            @click.prevent="addInput(index)"
          >
            +
          </button>
        </div>
      </div>
      <div
        v-if="input.error"
        class="input-error text-red-700 w-full py-2 px-4 text-center rounded-b-sm"
      >
        {{ input.error }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
  props: {
    inputs: {
      type: Array as PropType<{ value: string; operator: string }[]>,
      default() {
        return [];
      },
    },
    label: {
      type: String,
      default: "",
    },
    pluralLabel: {
      type: String,
      default: "",
    },
    defaultPlaceholder: {
      type: String,
      default: "",
    },
    operatorOptions: {
      type: Array as PropType<
        { value: string; label: string; placeholder?: string }[]
      >,
      default() {
        return [];
      },
    },
  },
  computed: {
    inputLabel(): string {
      if (this.inputs.length > 1) {
        if (this.pluralLabel) {
          return this.pluralLabel;
        }

        return `${this.label}s`;
      }

      return this.label;
    },
  },
  methods: {
    addInput(index: number): void {
      this.$emit("add-input", index);
    },
    removeInput(index: number): void {
      this.$emit("remove-input", index);
    },
    getPlaceholder(operator: string): string {
      const isNumber = operator.split("-")[1] === "number";

      if (isNumber) {
        return `ex: ${Math.floor(Math.random() * 4) + 1}`;
      }

      const option = this.operatorOptions.find(
        (option) => option.value === operator
      );

      if (!option || !option.placeholder) {
        return this.defaultPlaceholder || "";
      }

      return option.placeholder;
    },
  },
});
</script>

<style scoped>
.input-label {
  @apply font-semibold;
}

.input {
  @apply border px-3 flex-grow;
}

.operator-selector {
  @apply w-full h-10 pl-3 pr-6 text-base text-white appearance-none bg-transparent;
}

.input-button {
  @apply px-2 text-white flex flex-row items-center text-3xl;
}
</style>
