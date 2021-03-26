<template>
  <div class="mt-4 mb-4 w-full rounded overflow-hidden">
    <CopyComboLinkButton :combo-link="comboLink" />
    <SimiliarCombosButton :cards="cards" :combo-id="comboId" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import CopyComboLinkButton from "@/components/combo/CopyComboLinkButton.vue";
import SimiliarCombosButton from "@/components/combo/SimiliarCombosButton.vue";

export default Vue.extend({
  components: {
    CopyComboLinkButton,
    SimiliarCombosButton,
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
