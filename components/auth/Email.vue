<template>
  <div class="max-w-full md:w-72">
    <div v-if="!linkSent">
      <div class="mb-2 text-center">
        <p class="prompt-text">{{ promptText }}</p>
      </div>

      <form @submit.prevent="requestMagicLink">
        <div>
          <label class="sr-only" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            class="input"
            :class="{ 'border border-red-400': emailError }"
            type="text"
            placeholder="email address"
            @input="emailError = ''"
          />
          <ErrorMessage id="email-error" :message="emailError" />

          <input
            v-if="includeDisplayName"
            id="display-name"
            v-model="displayName"
            class="input mt-1"
            :class="{ 'border border-red-400': displayNameError }"
            type="text"
            placeholder="display name"
            @input="displayNameError = ''"
          />
          <ErrorMessage id="display-name-error" :message="displayNameError" />
        </div>

        <button type="submit" class="button w-full">
          {{ submitButtonText }}
        </button>
      </form>

      <slot />
    </div>

    <div id="link-sent-text" v-else>{{ linkSentText }}</div>
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
  props: {
    includeDisplayName: {
      type: Boolean,
      default: false,
    },
    promptText: {
      type: String,
      default: "",
    },
    submitButtonText: {
      type: String,
      default: "",
    },
    linkSentText: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      emailError: "",
      email: "",
      displayNameError: "",
      displayName: "",
      linkSent: false,
    };
  },
  methods: {
    requestMagicLink() {
      this.emailError = "";
      this.displayNameError = "";

      if (this.includeDisplayName && !this.displayName.trim()) {
        this.displayNameError = "Display name cannot be empty.";
      }

      if (!this.email.trim()) {
        this.emailError = "Email cannot be empty.";
      }

      if (this.displayNameError || this.emailError) {
        return;
      }

      return this.$store
        .dispatch("auth/requestMagicLink", {
          email: this.email,
          displayName: this.displayName,
        })
        .then(() => {
          this.linkSent = true;
        })
        .catch((err) => {
          this.emailError = err.message;
        });
    },
  },
});
</script>
