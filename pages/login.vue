<template>
  <div>
    <div v-if="!linkSent">
      <div class="mb-2 text-center">
        <p>Enter your email address to log in</p>
      </div>

      <form @submit.prevent="userSignIn">
        <div>
          <label class="sr-only" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            class="input"
            :class="{ 'border border-red-400': error }"
            type="text"
            @input="error = ''"
            placeholder="email address"
          />
          <ErrorMessage :message="error" />
        </div>

        <button type="submit" class="button w-full">Continue</button>
      </form>

      <hr class="my-2" />

      <nuxt-link class="button dark w-full text-center" to="/sign-up/"
        >Create an Account</nuxt-link
      >
    </div>

    <div v-else>Check your email on this device for a sign in link.</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

export default Vue.extend({
  components: {
    ErrorMessage,
  },
  layout: "splash",
  data() {
    return {
      error: "",
      email: "",
      linkSent: false,
    };
  },
  methods: {
    userSignIn() {
      this.error = "";

      return this.$store
        .dispatch("auth/requestMagicLink", {
          email: this.email,
        })
        .then(() => {
          this.linkSent = true;
        })
        .catch((err) => {
          this.error = err.message;
        });
    },
  },
});
</script>
