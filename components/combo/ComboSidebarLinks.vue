<template>
  <div class="mt-4 mb-4 w-full rounded overflow-hidden">
    <BuyComboButton :cards="cards" class="pb-1 border-b border-light" />
    <div class="mt-1">
      <CopyComboLinkButton :combo-link="comboLink" />
      <SimiliarCombosButton :cards="cards" :combo-id="comboId" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import CopyComboLinkButton from "@/components/combo/CopyComboLinkButton.vue";
import SimiliarCombosButton from "@/components/combo/SimiliarCombosButton.vue";
import BuyComboButton from "@/components/combo/BuyComboButton.vue";

export default Vue.extend({
  components: {
    CopyComboLinkButton,
    SimiliarCombosButton,
    BuyComboButton,
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
});
</script>
