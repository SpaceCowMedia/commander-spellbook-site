<template>
  <div>
    <div v-if="!passwordsMatch" class="auth-required">
      <div v-if="loaded" class="w-1/2 m-auto">
        <p class="mb-2">Enter Password</p>
        <input
          type="text"
          v-model="password"
          class="rounded bg-blue-300 focus:bg-blue-200 w-full p-4"
          :class="{ error }"
          @keydown.enter="submitPassword"
          @focus="error = false"
        />
      </div>
    </div>
    <slot v-else />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

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
  computed: {
    passwordsMatch(): boolean {
      return this.savedPassword === PASSWORD;
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
