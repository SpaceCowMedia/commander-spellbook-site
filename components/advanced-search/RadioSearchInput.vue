<template>
  <div>
    <div class="font-semibold">{{ label }}</div>

    <fieldset class="flex flex-col">
      <legend class="sr-only">Choose settings for {{ label }}</legend>
      <label
        v-for="(option, index) in options"
        :key="`${label}-radio-input-${index}`"
        :for="label + '-radio-input-' + index"
        class="radio-wrapper sm:inline-flex items-center mt-3"
      >
        <input
          :id="label + '-radio-input-' + index"
          type="radio"
          :name="formName"
          class="h-5 w-5"
          :checked="checkedValue === option.value"
          :value="option.value"
          @change="updateRadio(option.value)"
        /><span class="ml-2 text-dark">{{ option.label }}</span>
      </label>
    </fieldset>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
  props: {
    checkedValue: {
      type: String,
      default: "",
    },
    options: {
      type: Array as PropType<{ value: string; label: string }[]>,
      default() {
        return [];
      },
    },
    formName: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
  },
  methods: {
    updateRadio(value: string) {
      this.$emit("update-radio", value);
    },
  },
});
</script>
