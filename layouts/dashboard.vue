<template>
  <div>
    <AnalyticsCookieBanner />
    <div v-if="provisioned" class="w-full md:flex md:h-screen">
      <DashboardNav />
      <main class="p-8 flex-grow md:w-2/3 max-w-5xl mx-auto">
        <Nuxt />
      </main>
    </div>
    <div v-else>
      <CompleteAccountSetup class="md:h-screen" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AnalyticsCookieBanner from "@/components/AnalyticsCookieBanner.vue";
import DashboardNav from "@/components/dashboard/Nav.vue";
import CompleteAccountSetup from "@/components/dashboard/CompleteAccountSetup.vue";

export default Vue.extend({
  components: {
    AnalyticsCookieBanner,
    DashboardNav,
    CompleteAccountSetup,
  },
  computed: {
    provisioned(): boolean {
      return this.$store.getters["auth/user"].provisioned === true;
    },
  },
  async mounted() {
    await this.$store.dispatch("auth/lookupUser");

    if (!this.$store.getters["auth/isAuthenticated"]) {
      this.$router.push("/");
    }
  },
});
</script>
