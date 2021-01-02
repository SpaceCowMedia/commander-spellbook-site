<template>
  <div>
    <div
      v-for="(input, index) in inputs"
      :key="`${label}-input-${index}`"
      class="my-2 flex"
    >
      <div class="w-1/3 flex-grow">
        <span v-if="index === 0" class="input-label">{{ inputLabel }}</span>
      </div>
      <div class="w-2/3 flex flex-row">
        <input
          v-model="input.value"
          class="input"
          type="text"
          :placeholder="placeholder"
          @keyup="update(index)"
        />

        <button
          v-if="inputs.length > 1"
          type="button"
          class="minus-button input-button"
          @click.prevent="removeInput(index)"
        >
          −
        </button>
        <button
          type="button"
          class="plus-button input-button"
          @click.prevent="addInput(index)"
        >
          +
        </button>
      </div>
    </div>
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
    pluralLabel: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      inputs: [{ value: "" }],
    };
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
      this.inputs.splice(index + 1, 0, { value: "" });
    },
    removeInput(index: number): void {
      this.inputs.splice(index, 1);
    },
    update(index: number): void {
      const value = this.inputs[index].value;
      this.$emit("update", {
        index,
        value,
      });
    },
  },
});
</script>

<style scoped>
/* Styles here */
</style>
