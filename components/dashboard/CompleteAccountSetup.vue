<template>
  <div class="w-full flex h-full justify-center center-items gradient">
    <div class="bg-white p-4 rounded m-auto">
      <div v-if="!loaded" class="mx-16">
        <h1 class="heading-title">Loading</h1>
        <div class="spinner mt-4 h-32 w-32 bg-gray-300 m-auto"></div>
      </div>
      <div id="complete-account-setup" v-else>
        <h1 class="heading-title">Almost Done</h1>
        <p>Your account is almost set up. All we need now is a username.</p>

        <form @submit.prevent="onSubmit">
          <input
            v-model="username"
            class="input mt-2"
            placeholder="MyAwesomeUsername"
            @input="error = ''"
          />
          <ErrorMessage id="username-error" :message="error" />

          <div class="flex justify-center">
            <button type="submit" class="button">Complete Registration</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

export default Vue.extend({
  components: {
    ErrorMessage,
  },
  data() {
    return {
      loaded: false,
      username: "",
      error: "",
    };
  },
  async mounted() {
    await this.$store.dispatch("auth/lookupPermissions");

    if (this.$store.getters["auth/user"].provisioned === true) {
      return;
    }

    const displayName = window.localStorage.getItem("displayNameForSignUp");

    if (!displayName) {
      this.loaded = true;

      return;
    }

    this.username = displayName;
    window.localStorage.removeItem("displayNameForSignUp");

    await this.provision();

    this.loaded = true;
  },
  methods: {
    async provision() {
      const username = this.username.trim();

      if (!username) {
        this.error = "Username must not be empty.";
        return;
      }

      this.loaded = false;

      await this.$api("/user/provision", {
        username,
      }).catch((e) => {
        this.error = e.message;
      });

      if (this.error) {
        this.loaded = true;
        return;
      }

      // TODO with a fast connection, the transition is kind of abrupt. Explore putting a delay or some kind of transition animation for navigating to the dashboard view
      await this.$store.dispatch("auth/lookupPermissions");
    },
    onSubmit() {
      this.error = "";

      return this.provision();
    },
  },
});
</script>
