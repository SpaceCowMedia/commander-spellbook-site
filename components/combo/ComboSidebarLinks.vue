<template>
  <div class="mt-4 mb-4 w-full rounded overflow-hidden">
    <BuyComboButtons
      :cards="cards"
      :tcgplayer-price="tcgplayerPrice"
      :cardkingdom-price="cardkingdomPrice"
      class="pb-1 border-b border-light"
    />
    <div class="mt-1">
      <SimiliarCombosButton :cards="cards" :combo-id="comboId" />
      <EdhrecLink v-if="edhrecLink" :link="edhrecLink" />
      <nuxt-link
        id="report-error-button"
        class="button w-full"
        :to="'/report-error/?comboId=' + comboId"
        >Report an Error with this Combo</nuxt-link
      >
      <ShareComboButtons :combo-link="comboLink" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import SimiliarCombosButton from "@/components/combo/SimiliarCombosButton.vue";
import BuyComboButtons from "@/components/combo/BuyComboButtons.vue";
import ShareComboButtons from "@/components/combo/ShareComboButtons.vue";
import EdhrecLink from "@/components/combo/EdhrecLink.vue";

export default Vue.extend({
  components: {
    SimiliarCombosButton,
    BuyComboButtons,
    ShareComboButtons,
    EdhrecLink,
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
    edhrecLink: {
      type: String,
      default: "",
    },
    comboId: {
      type: String,
      default: "",
    },
    tcgplayerPrice: {
      type: String,
      default: "",
    },
    cardkingdomPrice: {
      type: String,
      default: "",
    },
  },
});
</script>
