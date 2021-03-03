<template>
  <div
    class="card-images container hidden lg:flex"
    :class="{ 'justify-center': cards.length < 4 }"
  >
    <div
      v-for="(card, index) in cards"
      :key="'oracle-card-image-' + index"
      class="card-img-wrapper"
      :class="{ expand: shouldExpand(index) }"
      @mouseover="hoveredOverCardIndex = index"
      @mouseout="hoveredOverCardIndex = -1"
    >
      <CardLink :name="card.name" @focus="hoveredOverCardIndex = index">
        <img :src="card.oracleImageUrl" :alt="card.name" />
      </CardLink>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import CardLink from "@/components/CardLink.vue";

export default Vue.extend({
  components: {
    CardLink,
  },
  props: {
    cards: {
      type: Array as PropType<{ name: string; oracleImageUrl: string }[]>,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      hoveredOverCardIndex: -1,
    };
  },
  methods: {
    shouldExpand(index: number): boolean {
      if (this.hoveredOverCardIndex < 0) {
        return false;
      }
      return (
        index - 4 === this.hoveredOverCardIndex ||
        index - 8 === this.hoveredOverCardIndex
      );
    },
  },
});
</script>

<style scoped>
.card-images {
  @apply relative flex-wrap -mt-20 mb-4;
}

.card-images .card-img-wrapper img {
  transition: all 1s ease;
  @apply relative rounded-lg top-0;
}

.card-images .card-img-wrapper {
  @apply relative w-1/4 p-1 flex-shrink rounded-xl;
}

.card-images .card-img-wrapper:nth-child(1n + 5) {
  margin-top: -30%;
}
.card-images .card-img-wrapper:nth-child(4n + 1) {
  @apply pl-0 pr-2;
}
.card-images .card-img-wrapper:nth-child(4n) {
  @apply pr-0 pl-2;
}

.card-images .card-img-wrapper.expand img {
  top: 87%;
}
</style>
