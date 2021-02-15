<template>
  <div class="md:flex-1 m-4 w-full rounded overflow-hidden">
    <div class="px-6 py-4">
      <h2 class="combo-list-title">{{ title }}</h2>
      <ol class="combo-list" :class="{ 'list-decimal': showNumbers }">
        <li v-for="(item, index) in iterations" :key="title + '-' + index">
          <TextWithMagicSymbol
            :text="item"
            :cards-in-combo="cardsInCombo"
            :include-card-links="includeCardLinks"
          />
        </li>
        <div v-if="iterations.length === 0">
          <!-- eslint-disable-next-line vue/require-v-for-key, vue/no-unused-vars -->
          <li v-for="n in numberOfPlacholderItems">
            <PlaceholderText :max-length="50" />
          </li>
        </div>
      </ol>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import TextWithMagicSymbol from "../TextWithMagicSymbol.vue";
import PlaceholderText from "../PlaceholderText.vue";

export default Vue.extend({
  components: {
    TextWithMagicSymbol,
    PlaceholderText,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    cardsInCombo: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
    includeCardLinks: {
      type: Boolean,
      default: false,
    },
    showNumbers: {
      type: Boolean,
      default: false,
    },
    iterations: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      numberOfPlacholderItems: 0,
    };
  },
  mounted() {
    this.numberOfPlacholderItems = Math.floor(Math.random() * 5) + 2;
  },
});
</script>

<style scoped>
.combo-list-title {
  @apply font-bold text-xl mb-2;
}
.combo-list {
  @apply text-gray-700 text-base list-inside;
}
</style>
