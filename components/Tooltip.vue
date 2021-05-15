<template>
  <span @mousemove="mousemove" @mouseout="mouseout">
    <div v-if="active" class="tooltip" :style="{ left, top }">
      <slot name="tooltip"></slot>
    </div>
    <slot name="content"></slot>
  </span>
</template>

<script lang="ts">
import Vue from "vue";

type TooltipData = {
  active: boolean;
  left: string;
  top: string;
};

export default Vue.extend({
  props: {
    leftOffset: {
      type: Number,
      default: 50,
    },
    rightOffset: {
      type: Number,
      default: 50,
    },
  },
  data(): TooltipData {
    return {
      active: false,
      left: "0px",
      top: "0px",
    };
  },
  methods: {
    mousemove(event: MouseEvent): void {
      const displayOnRightSide = window.innerWidth / 2 - event.clientX > 0;

      this.active = true;
      this.top = event.clientY - 30 + "px";

      if (displayOnRightSide) {
        this.left = event.clientX + this.rightOffset + "px";
      } else {
        this.left = event.clientX - this.leftOffset + "px";
      }
    },
    mouseout(): void {
      this.active = false;
    },
  },
});
</script>

<style scoped>
.tooltip {
  pointer-events: none;
  position: fixed;
  z-index: 9000000;
}
</style>
