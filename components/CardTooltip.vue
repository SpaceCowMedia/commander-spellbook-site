<template>
  <span @mousemove="mousemove" @mouseout="mouseout">
    <div v-if="hover" class="card-tooltip" :style="{ left, top }">
      <img v-if="cardName" :src="url" :alt="cardName" />
    </div>
    <slot />
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import getExternalCardData from "@/lib/get-external-card-data";

type TooltipData = {
  url: string;
  hover: boolean;
  left: string;
  top: string;
};

export default Vue.extend({
  props: {
    cardName: {
      type: String,
      default: "",
    },
  },
  data(): TooltipData {
    return {
      url: getExternalCardData(this.cardName).images.oracle,
      hover: false,
      left: "0px",
      top: "0px",
    };
  },
  methods: {
    mousemove(event: MouseEvent): void {
      this.hover = true;
      this.left = event.clientX + 50 + "px";
      this.top = event.clientY - 30 + "px";
    },
    mouseout(): void {
      this.hover = false;
    },
  },
});
</script>

<style scoped>
.card-tooltip {
  pointer-events: none;
  position: fixed;
  z-index: 9000000;
  border-radius: 4.75% / 3.5%;
  height: 340px;
  width: 244px;
  overflow: hidden;
}
</style>
