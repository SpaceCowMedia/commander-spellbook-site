<template>
  <div class="md:flex-1 m-4 w-full rounded overflow-hidden">
    <div class="px-6 py-4">
      <div class="combo-list-title">{{ title }}</div>
      <ol
        v-if="iterations.length"
        class="combo-list"
        :class="{ 'list-decimal': showNumbers }"
      >
        <li v-for="(item, index) in iterations" :key="title + '-' + index">
          <TextWithMagicSymbol :text="item" />
        </li>
      </ol>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import TextWithMagicSymbol from '../TextWithMagicSymbol.vue'

export default Vue.extend({
  components: {
    TextWithMagicSymbol,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    showNumbers: {
      type: Boolean,
      default: false,
    },
    iterations: {
      type: Array as PropType<string[]>,
      default() {
        return []
      },
    },
  },
})
</script>

<style scoped>
.combo-list-title {
  @apply font-bold text-xl mb-2;
}
.combo-list {
  @apply text-gray-700 text-base list-inside;
}
</style>
