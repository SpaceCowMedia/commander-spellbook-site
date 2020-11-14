<template>
  <header class="hidden sm:flex header">
    <div
      v-for="(card, index) in cards"
      :key="'card-header-image-' + index"
      class="m-2 flex-grow max-w-xs"
    >
      <img class="card-image" :src="card.cardImageUrl" />
    </div>
  </header>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

type Card = {
  cardImageUrl: string
}

export default Vue.extend({
  props: {
    cards: {
      type: Array as PropType<Card[]>,
      default() {
        return []
      },
    },
  },
})
</script>

<style scoped>
.header {
  background: rgb(92, 126, 159);
  @apply w-full justify-center;
}

.card-image {
  border-radius: 5%;
}
</style>
