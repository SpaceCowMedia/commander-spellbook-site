<template>
  <div>
    <h1 class="heading-title">Dashboard</h1>

    <p>
      Welcome back {{ displayName }}. Your email is {{ email }}. This page will
      likely serve as a dashboard for you, depending on what you're allowed to
      do in the dashboard. (edit combos, manage users, etc)
    </p>

    <h2>Points</h2>

    <div>TODO</div>

    <h2>Update User Profile</h2>

    <div>TODO</div>

    <h2>Recently Proposed Combos (TODO)</h2>

    <div class="flex">
      <div class="animate-pulse bg-gray-300 rounded-sm h-32 w-32 mr-2"></div>
      <div class="animate-pulse bg-gray-300 rounded-sm h-32 w-32 mx-2"></div>
      <div class="animate-pulse bg-gray-300 rounded-sm h-32 w-32 ml-2"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  layout: "dashboard",
  computed: {
    displayName(): string {
      return this.$store.getters["auth/user"].displayName;
    },
    email(): string {
      return this.$store.getters["auth/user"].email;
    },
  },
});
</script>

<style scoped>
h2 {
  @apply font-title text-xl mt-4;
}
</style>
