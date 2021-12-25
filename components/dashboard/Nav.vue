<template>
  <nav class="text-white md:text-2xl md:w-1/3 md:max-w-md gradient">
    <div class="relative z-10">
      <NuxtLink to="/" class="md:h-1/6 flex p-4">
        <span class="sr-only">Commander Spellbook</span>
        <img
          src="~/assets/images/logo.svg"
          class="inline-block pr-4 w-1/3"
          alt="Commander Spellbook Logo"
          aria-hidden="true"
        />
        <img
          src="~/assets/images/title.svg"
          class="inline-block w-2/3"
          alt="Commander Spellbook"
          aria-hidden="true"
        />
      </NuxtLink>
      <div class="md:h-1/3 py-4 md:ml-2 md:m-h-32 bg-dark md:rounded-l-lg">
        <ul v-if="loaded">
          <li>
            <NuxtLink to="/dashboard/">Recent Activity</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/dashboard/account-settings/"
              >Account Settings</NuxtLink
            >
          </li>
          <li v-if="permissions.proposeCombo">
            <NuxtLink to="/dashboard/propose-combo/"
              >Propose New Combo</NuxtLink
            >
          </li>
          <li v-if="permissions.viewUsers">
            <NuxtLink to="/dashboard/users/">Users</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/signout/">Sign Out</NuxtLink>
          </li>
        </ul>
        <div v-else class="flex justify-center h-full">
          <div class="spinner bg-white h-16 w-16 m-auto"></div>
        </div>
      </div>
    </div>
    <div class="biblioplex-bg"></div>
  </nav>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      loaded: false,
      permissions: {
        proposeCombo: false,
        manageUserPermissions: false,
        viewUsers: false,
      },
    };
  },
  async mounted() {
    const permissions = await this.$store.dispatch("auth/lookupPermissions");

    this.permissions.proposeCombo = permissions.proposeCombo;
    this.permissions.manageUserPermissions = permissions.manageUserPermissions;
    this.permissions.viewUsers = permissions.viewUsers;

    this.loaded = true;
  },
  methods: {
    signout() {
      this.$router.push("/signout/");
    },
  },
});
</script>

<style scoped>
nav {
  @apply relative;
}

nav ul li a {
  @apply text-white no-underline px-4 w-full inline-block  py-2 ml-4;
}

nav ul li a.nuxt-link-exact-active {
  @apply text-dark bg-white rounded-l-md ml-4;
}

.biblioplex-bg {
  background: url("~assets/images/hi-res-mtg/The-Biblioplex.jpg");
  @apply absolute top-0 bottom-0 left-0 right-0 opacity-25 bg-cover bg-center;
}
</style>
