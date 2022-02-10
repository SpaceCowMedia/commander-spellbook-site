<template>
  <EmailDialog
    prompt-text="Enter your email address to create an account"
    :include-display-name="true"
    submit-button-text="Create Account"
    link-sent-text="Check your email to complete the setup process."
  />
</template>

<script lang="ts">
import Vue from "vue";
import EmailDialog from "@/components/auth/EmailDialog.vue";

export default Vue.extend({
  components: {
    EmailDialog,
  },
  layout: "SplashLayout",
});
</script>
