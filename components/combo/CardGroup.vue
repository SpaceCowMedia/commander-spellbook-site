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
      <CardLink
        :name="card.name"
        class="relative"
        @focus="hoveredOverCardIndex = index"
      >
        <Flipper :flipped="loaded[index]">
          <template slot="front">
            <img
              class="back-card"
              src="~/assets/images/card-back.png"
              :alt="card.name"
            />
          </template>
          <template slot="back">
            <img
              class="front-card"
              :src="card.oracleImageUrl"
              :alt="card.name"
              @load="onImgLoad(index)"
            />
          </template>
        </Flipper>
      </CardLink>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import CardLink from "@/components/CardLink.vue";
import Flipper from "@/components/Flipper.vue";

export default Vue.extend({
  components: {
    CardLink,
    Flipper,
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
      loaded: [] as boolean[],
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
    onImgLoad(index: number): void {
      this.loaded[index] = true;
      this.$forceUpdate();
    },
  },
});
</script>

<style scoped>
.card-images {
  @apply relative flex-wrap -mt-20 mb-4;
}

.card-images .card-img-wrapper img {
  @apply rounded-xl relative top-0 transition-all duration-1000 ease-in-out;
}

.card-images .card-img-wrapper.expand img {
  top: 295px;
}

.card-back.loaded {
  @apply bg-opacity-0;
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
</style>
