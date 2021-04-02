<template>
  <Flipper :flipped="loaded">
    <template slot="front">
      <img class="back-card" src="~/assets/images/card-back.png" :alt="name" />
    </template>
    <template slot="back">
      <img class="front-card" :src="img" :alt="name" @load="onImgLoad" />
    </template>
  </Flipper>
</template>

<script lang="ts">
import Vue from "vue";
import Flipper from "@/components/Flipper.vue";

export default Vue.extend({
  components: {
    Flipper,
  },
  props: {
    img: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      loaded: false,
    };
  },
  methods: {
    onImgLoad(): void {
      this.loaded = true;
    },
  },
});
</script>

<style scoped>
.front-card {
  @apply rounded-xl;
}
</style>
