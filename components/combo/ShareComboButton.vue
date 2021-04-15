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

    <SharingMenu v-if="showMenu" />
  </div>
</template>

<script>
import Vue from "vue";
import SharingMenu from "@/components/combo/SharingMenu.vue";

export default Vue.extend({
  Data: () => ({
    showMenu: false,
  }),
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
