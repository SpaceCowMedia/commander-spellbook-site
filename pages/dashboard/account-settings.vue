<template>
  <div>
    <h1 class="heading-title">Account Settings</h1>
    <DashboardSection title="Profile Settings">
      <form @submit.prevent="updateProfile">
        <ProfileInput
          id="account-settings-display-name-input"
          v-model="displayName"
          class="mt-0"
          label="Display Name"
          helper-text="This will be displayed for editors and admins on any combos you
          propose."
        />

        <ProfileInput
          id="account-settings-email-input"
          v-model="email"
          label="Email"
          :disabled="true"
          helper-text="This is what you use to sign in to Commander Spellbook. TODO: make this able to be updated."
        />

        <div>
          <button
            type="submit"
            class="button m-0"
            :class="{ disabled: !isUpdateable }"
          >
            Update Profile
          </button>
        </div>
      </form>
    </DashboardSection>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import DashboardSection from "@/components/dashboard/DashboardSection.vue";
import ProfileInput from "@/components/dashboard/ProfileInput.vue";

export default Vue.extend({
  components: {
    DashboardSection,
    ProfileInput,
  },
  layout: "EditorDashboard",
  data() {
    const user = this.$store.getters["auth/user"];

    return {
      // TODO figure out why display name can be unset here
      displayName: user.displayName || "",
      email: user.email || "",
      error: "",
    };
  },
  computed: {
    isUpdateable(): boolean {
      const user = this.$store.getters["auth/user"];

      return (
        user.displayName !== this.displayName.trim() ||
        user.email !== this.email.trim()
      );
    },
  },
  methods: {
    updateProfile(): Promise<void> {
      if (!this.isUpdateable) {
        return Promise.resolve();
      }

      return this.$store
        .dispatch("auth/updateProfile", {
          displayName: this.displayName.trim(),
        })
        .catch((err) => {
          // TODO how to expose this
          this.error = err.message;
        });
    },
  },
});
</script>
