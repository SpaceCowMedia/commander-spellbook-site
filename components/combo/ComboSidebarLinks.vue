<template>
  <div class="mt-4 mb-4 w-full rounded overflow-hidden">
    <button
      ref="copyButton"
      class="combo-button"
      type="button"
      @click="copyComboLink"
    >
      Copy Combo Link
    </button>

    <br />
    <br />
    <p>Additional utilities here</p>

    <input
      ref="copyInput"
      type="text"
      class="hidden-combo-link-input"
      :value="comboLink"
    />
    <div
      ref="copyNotification"
      class="copy-combo-notification w-full md:w-1/2"
      :class="{ show: showCopyNotification }"
    >
      Combo link copied to your clipboard!
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    comboLink: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      showCopyNotification: false,
    };
  },
  methods: {
    copyComboLink(): void {
      (this.$refs.copyInput as HTMLInputElement).select();
      document.execCommand("copy");

      this.showCopyNotification = true;

      setTimeout(() => {
        this.showCopyNotification = false;
      }, 2000);

      window.requestAnimationFrame(() => {
        (this.$refs.copyButton as HTMLButtonElement).blur();
      });
    },
  },
});
</script>

<style scoped>
.combo-button {
  @apply bg-white  text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow;
}

.combo-button:hover {
  @apply bg-gray-100;
}

.hidden-combo-link-input {
  left: -25%;
  top: -25%;
  @apply fixed;
}

.copy-combo-notification {
  /* Tailwind 2 class: -bottom-20 */
  bottom: -5rem;
  @apply transition-all duration-1000 fixed left-0 right-0 m-auto p-4 bg-black text-white;
}

.copy-combo-notification.show {
  /* Tailwind 2 class: bottom-4 */
  bottom: 1rem;
}
</style>
