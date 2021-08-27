<template>
  <div class="static-page">
    <ArtCircle
      card-name="Codie, Vociferous Codex"
      artist="Daniel Ljunggren"
      class="m-auto md:block hidden"
    />
    <h1 class="heading-title">Login</h1>

    <div>
      <form @submit.prevent="userSignIn">
        <ErrorMessage v-if="error" :message="error" @close="error = ''" />

        <div class="mb-2">
          <label class="sr-only" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            class="input"
            type="text"
            placeholder="email address"
          />
        </div>

        <div class="mb-2">
          <label class="sr-only" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            class="input"
            type="password"
            placeholder="password"
          />
        </div>

        <button type="submit" class="button w-full">Login</button>

        <hr class="my-2" />

        <p class="text-center">
          Need an account?
          <nuxt-link to="/sign-up/">Sign up!</nuxt-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ArtCircle from "@/components/ArtCircle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

export default Vue.extend({
  components: {
    ArtCircle,
    ErrorMessage,
  },
  layout: "splash",
  data() {
    return {
      error: "",
      email: "",
      password: "",
    };
  },
  methods: {
    userSignIn() {
      this.error = "";

      return this.$store
        .dispatch("auth/signInWithEmail", {
          email: this.email,
          password: this.password,
        })
        .then(() => {
          this.$router.push("/profile/");
        })
        .catch((err) => {
          this.error = err.message;
        });
    },
  },
});
</script>
