<template>
  <div>
    <label class="input-label">{{ inputLabel }}</label>

    <div
      v-for="(input, index) in inputs"
      :key="`${label}-input-${index}`"
      class="my-2"
      :class="'input-wrapper-' + index"
    >
      <div class="sm:flex">
        <Select
          :id="label + '-select-' + index"
          v-model="input.operator"
          :label="'Modifier for ' + label"
          :select-background-class="
            input.error
              ? 'border-danger border border-b-0 sm:border-b sm:border-r-0'
              : 'border-dark border border-b-0 sm:border-b sm:border-r-0'
          "
          :options="operatorOptions"
          :class="{
            ['select-' + index]: true,
          }"
        />

        <div class="w-full flex-grow flex flex-col sm:flex-row">
          <AutocompleteInput
            v-model="input.value"
            :input-id="getInputId(index)"
            :placeholder="getPlaceholder(input.operator)"
            :label="inputLabel"
            :autocomplete-options="autocompleteOptions"
            :error="input.error"
            :active="autocompleteOptions.length > 0"
          />

          <div class="flex">
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
              class="plus-button input-button sm:rounded-r-sm"
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
import AutocompleteInput from "@/components/advanced-search/AutocompleteInput.vue";
import Select from "@/components/Select.vue";

type MultiSearchInputValue = { value: string; operator: string }[];

export default Vue.extend({
  components: {
    AutocompleteInput,
    Select,
  },
  props: {
    value: {
      type: Array as PropType<MultiSearchInputValue>,
      default() {
        return [];
      },
    },
    autocompleteOptions: {
      type: Array as PropType<{ value: string; label: string }[]>,
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
    defaultOperator: {
      type: String,
      default: ":",
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
    inputs: {
      get(): MultiSearchInputValue {
        return this.value;
      },
      set(value: MultiSearchInputValue): void {
        this.$emit("input", value);
      },
    },
  },
  methods: {
    addInput(index: number): void {
      this.inputs.splice(index + 1, 0, {
        value: "",
        operator: this.defaultOperator,
      });
    },
    removeInput(index: number): void {
      this.inputs.splice(index, 1);
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

.input-button {
  @apply px-2 text-white flex flex-row items-center text-3xl border flex-grow justify-center;
}
</style>
