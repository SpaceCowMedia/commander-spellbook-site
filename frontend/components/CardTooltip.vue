<template>
  <span @mousemove="mousemove" @mouseout="mouseout">
    <div v-if="active" class="card-tooltip" :style="{ left, top }">
      <img v-if="cardName" :src="url" :alt="cardName" />
    </div>
    <slot />
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import getExternalCardData from "@/lib/get-external-card-data";

export default Vue.extend({
  props: {
    cardName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      active: false,
      left: "0px",
      top: "0px",
      url: getExternalCardData(this.cardName).images.oracle,
    };
  },
  methods: {
    mousemove(event: MouseEvent): void {
      const displayOnRightSide = window.innerWidth / 2 - event.clientX > 0;

      this.active = true;
      this.top = event.clientY - 30 + "px";

      if (displayOnRightSide) {
        this.left = event.clientX + 50 + "px";
      } else {
        this.left = event.clientX - 290 + "px";
      }
    },
    mouseout(): void {
      this.active = false;
    },
  },
});
</script>

<style scoped>
.card-tooltip {
  pointer-events: none;
  position: fixed;
  z-index: 9000000;
  overflow: hidden;
  border-radius: 4.75% / 3.5%;
  height: 340px;
  width: 244px;
}
</style>
