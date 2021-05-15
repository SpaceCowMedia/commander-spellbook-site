<template>
  <Tooltip :left-offset="290">
    <template #tooltip>
      <div class="card-tooltip">
        <img v-if="cardName" :src="url" :alt="cardName" />
      </div>
    </template>
    <template #content>
      <slot />
    </template>
  </Tooltip>
</template>

<script lang="ts">
import Vue from "vue";
import Tooltip from "@/components/Tooltip.vue";
import getExternalCardData from "@/lib/get-external-card-data";

export default Vue.extend({
  components: {
    Tooltip,
  },
  props: {
    cardName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      url: getExternalCardData(this.cardName).images.oracle,
    };
  },
});
</script>

<style scoped>
.card-tooltip {
  overflow: hidden;
  border-radius: 4.75% / 3.5%;
  height: 340px;
  width: 244px;
}
</style>
