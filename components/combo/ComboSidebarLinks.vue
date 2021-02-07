<template>
  <div class="mt-4 mb-4 w-full rounded overflow-hidden">
    <button
      id="copy-combo-button"
      ref="copyButton"
      class="combo-button"
      type="button"
      @click="copyComboLink"
    >
      Copy Combo Link
    </button>

    <div v-if="hasSimiliarCombos" id="has-similiar-combos">
      <nuxt-link :to="similiarCombosLink">
        <button class="combo-button">
          Find Other Combos Using These Cards
        </button>
      </nuxt-link>
    </div>

    <input
      ref="copyInput"
      type="hidden"
      class="hidden-combo-link-input"
      :value="comboLink"
    />
    <!-- This is a bit convoluated, but to get the notification we want
    to animate correctly, we it to be always on screen (but out of frame)
    to slide up from the bottom, screen readers need it to appear to read
    the message to the user. Therfore, we have 2 version, one that is not
    visible in the UI but alerts the user with a screenreader, and one
    that is visible in the UI, but is hidden to screen readers. -->
    <div v-if="showCopyNotification" role="alert" class="sr-only">
      Combo link copied to your clipboard
    </div>
    <div
      aria-hidden="true"
      class="copy-combo-notification w-full md:w-1/2"
      :class="{ show: showCopyNotification }"
    >
      Combo link copied to your clipboard!
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import spellbookApi from "commander-spellbook";

export default Vue.extend({
  props: {
    cards: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
    comboLink: {
      type: String,
      default: "",
    },
    comboId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      showCopyNotification: false,
      hasSimiliarCombos: false,
    };
  },
  async fetch() {
    await this.lookupSimiliarCombos();
  },

  computed: {
    similiarSearchString(): string {
      return this.cards.reduce((accum, name) => {
        // TODO support single quote
        return accum + ` card="${name}"`;
      }, `-id:${this.comboId}`);
    },
    similiarCombosLink(): string {
      return `/search?q=${encodeURIComponent(this.similiarSearchString)}`;
    },
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
    async lookupSimiliarCombos(): Promise<void> {
      const result = await spellbookApi.search(this.similiarSearchString);

      this.hasSimiliarCombos = result.combos.length > 0;
    },
  },
});
</script>

<style scoped>
.combo-button {
  @apply w-full bg-white block mx-auto mb-4 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow;
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
