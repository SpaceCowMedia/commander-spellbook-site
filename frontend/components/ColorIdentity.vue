<template>
  <div class="w-full text-center">
    <p class="sr-only">Color Identity: {{ colorIdentityDescription }}</p>
    <ManaSymbol v-for="color in colors" :key="color" aria-hidden="true" :size="size" :symbol="color"></ManaSymbol>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import ManaSymbol from "./ManaSymbol.vue"

export default Vue.extend({
  components: {
    ManaSymbol,
  },
  props: {
    colors: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
    size: {
      type: String,
      default: "medium",
    },
  },
  computed: {
    colorIdentityDescription(): string {
      return this.colors.join(", ");
    },
  },
});
</script>
