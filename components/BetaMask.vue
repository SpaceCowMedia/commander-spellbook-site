<template>
  <div>
    <div v-show="!passwordsMatch" class="auth-required">
      <div v-if="loaded" class="w-1/2 m-auto">
        <p class="mb-2">Enter Password</p>
        <input
          v-model="password"
          type="text"
          class="rounded bg-blue-300 focus:bg-blue-200 w-full p-4"
          :class="{ error }"
          @keydown.enter="submitPassword"
          @focus="error = false"
        />
      </div>
    </div>
    <slot v-show="passwordMatch" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

// This is not meant as a secure way to keep people out
// (obviously, it's revealed directly on the client),
// but to just provide a simple way to obscure the beta
// version of the site. This component will be removed
// when the site is ready to go to production
const PASSWORD = "arjun";

export default Vue.extend({
  data() {
    return {
      password: "",
      savedPassword: "",
      error: false,
      loaded: false,
    };
  },
  computed: {
    passwordsMatch(): boolean {
      return this.savedPassword === PASSWORD;
    },
  },
  mounted(): void {
    // localStorage.removeItem("savedPassword");
    this.savedPassword = localStorage.getItem("savedPassword") || "";
    this.loaded = true;
  },
  methods: {
    submitPassword(): void {
      this.error = false;

      const pw = this.password.toLowerCase();

      if (pw !== PASSWORD) {
        this.error = true;
        return;
      }

      localStorage.setItem("savedPassword", pw);
      this.savedPassword = pw;
    },
  },
});
</script>

<style scoped>
.auth-required {
  @apply flex flex-col justify-center text-center h-screen w-full bg-white;
}

.error {
  @apply bg-red-300;
}
</style>
