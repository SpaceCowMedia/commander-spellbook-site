<template>
  <div class="md:flex md:h-screen">
    <DashboardNav />
    <main class="p-8 flex-grow w-2/3 max-w-5xl mx-auto">
      <Nuxt v-if="loaded" />
      <div class="flex h-full justify-center pt-32" v-else>
        <div class="spinner h-32 w-32 bg-gray-300"></div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import DashboardNav from "@/components/dashboard/Nav.vue";

export default Vue.extend({
  components: {
    DashboardNav,
  },
  computed: {
    loaded(): boolean {
      return this.$store.getters["auth/user"].provisioned === true;
    },
  },
});
</script>
