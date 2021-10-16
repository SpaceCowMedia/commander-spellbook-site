<template>
  <div class="static-page">
    <div v-if="loaded">
      <h1 class="heading-title">Profile</h1>
      <p class="text-center">
        <button @click="signout" class="button">Sign Out</button>
      </p>

      <p id="email"><strong class="font-bold">Email:</strong> {{ email }}</p>
      <p id="display-name">
        <strong class="font-bold">Display Name:</strong>
        {{ displayName }}
      </p>

      <div class="my-2">
        <p>TODO: change display name</p>
        <p>TODO: change email</p>
        <p>TODO: points</p>
        <p>TODO: list of combos submitted by user with their statuses</p>
        <p>TODO: filter combos by status</p>
      </div>

      <div v-if="permissions.length > 0" class="my-2">
        <strong>Permissions</strong>
        <ul id="permissions">
          <li v-for="per in permissions" :key="per">
            {{ per }}
          </li>
        </ul>
      </div>
    </div>

    <SplashPage
      v-else
      title="Loading Profile"
      flavor="One piercing stare usually convinces thieves to go elsewhere."
      :pulse="true"
      art-circle-card-name="Doorkeeper"
      art-circle-artist-name="Kev Walker"
    ></SplashPage>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import SplashPage from "@/components/SplashPage.vue";

export default Vue.extend({
  components: {
    SplashPage,
  },
  data() {
    return {
      loaded: false,
      email: "",
      displayName: "",
      permissions: [] as string[],
    };
  },
  async mounted() {
    const permissions = await this.$store.dispatch("auth/lookupPermissions");
    const user = this.$fire.auth.currentUser;

    if (!user) {
      this.signout();
      return;
    }

    this.email = user.email || "";
    this.displayName = user.displayName || "";

    if (permissions.proposeCombo === true) {
      this.permissions.push("Propose New Combos");
    }

    this.loaded = true;
  },
  methods: {
    signout() {
      this.$router.push("/signout/");
    },
  },
});
</script>
