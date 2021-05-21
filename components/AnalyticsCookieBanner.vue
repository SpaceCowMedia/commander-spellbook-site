<template>
  <!-- adapted from https://www.carlcassar.com/articles/add-google-analytics-to-a-nuxt-js-app/ -->
  <div
    v-if="isOpen"
    class="
      border-b-2 border-dark
      lg:flex
      items-center
      p-4
      bg-white
      shadow-lg
      justify-center
      w-full
      text-dark
    "
  >
    <div class="text-5xl pb-2 leading-none text-center">🍪</div>
    <div class="lg:mx-8 text-center">
      <p>
        Can we use cookies for analytics? Read
        <nuxt-link to="/privacy-policy/">the privacy policy</nuxt-link>
        for more information.
      </p>
    </div>
    <div class="flex justify-center mt-4 lg:mt-0">
      <button id="cookie-accept-button" class="button" @click="accept">
        Sure!
      </button>
      <button id="cookie-deny-button" class="button" @click="deny">Nope</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { bootstrap } from "vue-gtag";

export default Vue.extend({
  data() {
    return {
      isOpen: false,
    };
  },
  mounted(): void {
    // if the user has set it, it will be either the string
    // "true" or "false", so we can show the modal when the
    // value returned from localstorage is undefined
    const hasSetGDPRChoice = Boolean(this.getGDPR());

    this.isOpen = !hasSetGDPRChoice;
  },
  methods: {
    getGDPR(): string {
      if (process.browser) {
        return localStorage.getItem("GDPR:accepted") || "";
      }

      return "";
    },
    accept(): Promise<void> {
      return bootstrap().then(() => {
        this.isOpen = false;
        localStorage.setItem("GDPR:accepted", "true");
        location.reload();
      });
    },
    deny(): void {
      this.isOpen = false;
      localStorage.setItem("GDPR:accepted", "false");
    },
  },
});
</script>

<style scoped>
.button {
  @apply border  px-4 py-2 rounded cursor-pointer mx-2;
}
</style>
