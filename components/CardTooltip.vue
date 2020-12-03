<template>
  <span @mousemove="mousemove" @mouseout="mouseout">
    <div v-if="hover" class="card-tooltip" :style="{ left, top }">
      <img v-if="cardName" :src="imgSrc" />
    </div>
    <slot />
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

type TooltipData = {
  hover: boolean
  left: string
  top: string
}

export default Vue.extend({
  data(): TooltipData {
    return {
      hover: false,
      left: '0px',
      top: '0px',
    }
  },
  props: {
    cardName: {
      type: String,
      default: '',
    },
  },
  methods: {
    mousemove(event: MouseEvent): void {
      this.hover = true
      this.left = event.clientX + 50 + 'px'
      this.top = event.clientY - 30 + 'px'
    },
    mouseout(): void {
      this.hover = false
    },
  },
  computed: {
    imgSrc(): string {
      return `https://api.scryfall.com/cards/named?exact=${this.cardName}&format=image`
    },
  },
})
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
