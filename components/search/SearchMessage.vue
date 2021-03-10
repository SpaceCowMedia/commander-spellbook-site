<template>
  <div>
    <div v-if="errors" class="search-errors">
      <div class="py-4 container">
        {{ errors }}
      </div>
    </div>
    <div v-if="message" class="search-description">
      <div class="py-4 container">
        {{ fullMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    message: {
      type: String,
      default: "",
    },
    errors: {
      type: String,
      default: "",
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    maxNumberOfCombosPerPage: {
      type: Number,
      default: 1,
    },
    totalResults: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    firstResult(): number {
      return (
        this.currentPage * this.maxNumberOfCombosPerPage -
        this.maxNumberOfCombosPerPage +
        1
      );
    },
    lastResult(): number {
      const finalResult = this.firstResult + this.maxNumberOfCombosPerPage - 1;

      if (finalResult > this.totalResults) {
        return this.totalResults;
      }

      return finalResult;
    },
    fullMessage(): string {
      if (this.totalPages <= 1) {
        return this.message;
      }

      return `${this.firstResult}-${this.lastResult} of ${this.message}`;
    },
  },
});
</script>

<style scoped>
.search-errors {
  @apply border-t border-gray-400 bg-warning;
}

.search-description {
  @apply border-t border-b border-gray-400;
}
</style>
