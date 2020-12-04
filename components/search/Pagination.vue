<template>
  <div class="px-4 py-3 flex items-center justify-between sm:px-6">
    <div class="flex-1 flex justify-between">
      <button
        class="back-button nav-button"
        :class="{ invisible: currentPage === 1 }"
        @click="goBack"
      >
        <svg
          class="nav-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        Previous
      </button>

      <div class="flex-1 items-center justify-center hidden sm:inline-flex">
        <p class="text-sm text-gray-700">
          <span v-if="totalResults <= pageSize" class="simple-result-message">
            <span class="font-medium">{{ totalResults }}</span> results
          </span>
          <span v-else class="complex-result-message">
            Showing
            <span class="font-medium">{{ firstResult }}</span>
            -
            <span class="font-medium">{{ lastResult }}</span>
            of
            <span class="font-medium">{{ totalResults }}</span>
            results
          </span>
        </p>
      </div>

      <button
        class="forward-button nav-button"
        :class="{ invisible: currentPage >= totalPages }"
        @click="goForward"
      >
        Next
        <svg
          class="nav-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    pageSize: {
      type: Number,
      default: 1,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
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
      return this.currentPage * this.pageSize - this.pageSize + 1;
    },
    lastResult(): number {
      const finalResult = this.firstResult + this.pageSize - 1;

      if (finalResult > this.totalResults) {
        return this.totalResults;
      }

      return finalResult;
    },
  },
  methods: {
    goBack(): void {
      this.$emit("go-back");
    },
    goForward(): void {
      this.$emit("go-forward");
    },
  },
});
</script>

<style scoped>
.nav-button {
  @apply ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700;
}

.nav-button:hover {
  @apply text-gray-500;
}

.nav-icon {
  @apply h-5 w-5;
}
</style>
