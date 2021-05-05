<template>
  <div>
    <button
      id="share-button"
      class="button w-full"
      type="button"
      @click="toggleMenu()"
    >
      Share combo
    </button>
    <transition name="slide">
      <SharingMenu v-if="showMenu" />
    </transition>
  </div>
</template>

<script>
import Vue from "vue";
import SharingMenu from "@/components/combo/SharingMenu.vue";

export default Vue.extend({
  data() {
    return {
      showMenu: false,
    };
  },
  components: {
    SharingMenu,
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
  },
});
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.6s ease;
}
.slide-enter,
.slide-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
