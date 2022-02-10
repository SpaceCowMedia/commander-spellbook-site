<template>
  <EmailDialog
    prompt-text="Enter your email address to log in"
    submit-button-text="Continue"
  >
    <hr class="my-2" />

    <nuxt-link class="button dark w-full text-center" to="/sign-up/"
      >Create an Account</nuxt-link
    >
  </EmailDialog>
</template>

<script lang="ts">
import Vue from "vue";
import EmailDialog from "@/components/auth/EmailDialog.vue";

export default Vue.extend({
  name: "LoginPage",
  components: {
    EmailDialog,
  },
  layout: "SplashLayout",
});
</script>
