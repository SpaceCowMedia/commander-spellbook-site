<template>
  <div class="w-full text-center">
    <!-- eslint-disable-next-line vue/require-v-for-key -->
    <img v-for="color in colorIdentity" class="color-identity" :src="color" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import scryfall from "scryfall-client";

export default Vue.extend({
  props: {
    colors: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
  },
  computed: {
    colorIdentity(): string[] {
      return this.colors.map((c) => scryfall.getSymbolUrl(c));
    },
  },
});
</script>

<style scoped>
.color-identity {
  @apply m-2 inline-block w-10;
}
</style>
