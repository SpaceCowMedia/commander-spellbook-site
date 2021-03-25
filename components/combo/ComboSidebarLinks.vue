<template>
  <div class="mt-4 mb-4 w-full rounded overflow-hidden">
    <CopyComboLinkButton :combo-link="comboLink" />

    <button
      v-if="hasSimiliarCombos"
      id="has-similiar-combos"
      class="button"
      @click="goToSimiliarCombos"
    >
      Find Other Combos Using These Cards
    </button>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import search from "@/lib/api/search";
import CopyComboLinkButton from "@/components/combo/CopyComboLinkButton.vue";

export default Vue.extend({
  components: {
    CopyComboLinkButton,
  },
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
      }, `-spellbookid:${this.comboId}`);
    },
  },
  methods: {
    async lookupSimiliarCombos(): Promise<void> {
      const result = await search(this.similiarSearchString);

      this.hasSimiliarCombos = result.combos.length > 0;
    },
    goToSimiliarCombos(): void {
      this.$gtag.event("Combos Using These Cards Button Clicked", {
        event_category: "Combo Detail Page Actions",
      });

      this.$router.push({
        path: "/search",
        query: {
          q: this.similiarSearchString,
        },
      });
    },
  },
});
</script>

<style scoped>
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
