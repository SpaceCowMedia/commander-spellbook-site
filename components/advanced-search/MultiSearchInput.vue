<template>
  <div>
    <label class="input-label">{{ inputLabel }}</label>

    <div
      v-for="(input, index) in inputs"
      :key="`${label}-input-${index}`"
      class="my-2"
      :class="'input-wrapper-' + index"
    >
      <div class="flex">
        <Select
          :id="label + '-select-' + index"
          v-model="input.operator"
          :label="'Modifier for ' + label"
          :select-background-class="
            input.error
              ? 'border-danger border border-r-0'
              : 'border-dark border border-r-0'
          "
          :options="operatorOptions"
          :class="{
            ['select-' + index]: true,
          }"
        />

        <div class="w-full flex-grow flex flex-row">
          <label class="sr-only" aria-hidden="true" :for="getInputId(index)">{{
            inputLabel
          }}</label>
          <input
            :id="getInputId(index)"
            v-model="input.value"
            class="input"
            :class="{
              ['input-' + index]: true,
              'border-dark': !input.error,
              'border-danger': input.error,
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
              'bg-dark border-dark': !input.error,
              'bg-danger border-danger': input.error,
            }"
            @click.prevent="removeInput(index)"
          >
            <span class="sr-only">Remove this search query</span>
            <span aria-hidden="true">−</span>
          </button>
          <button
            type="button"
            class="plus-button input-button rounded-r-sm"
            :class="{
              ['plus-button-' + index]: true,
              'bg-dark border-dark': !input.error,
              'bg-danger border-danger': input.error,
            }"
            @click.prevent="addInput(index)"
          >
            <span class="sr-only">Add a new search query of this type</span>
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
      <div
        v-if="input.error"
        class="input-error text-danger w-full py-2 px-4 text-center rounded-b-sm"
      >
        {{ input.error }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import Select from "@/components/Select.vue";

export default Vue.extend({
  components: {
    Select,
  },
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
    getInputId(index: number): string {
      return `${this.label}-input-${index}`;
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

.input-button {
  @apply px-2 text-white flex flex-row items-center text-3xl border;
}
</style>
