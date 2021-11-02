<template>
  <div>
    <DashboardSection title="Profile Settings">
      <form @submit.prevent="updateProfile">
        <ProfileInput
          v-model="displayName"
          class="mt-0"
          label="Display Name"
          helper-text="This will be displayed for editors and admins on any combos you
          propose."
        />

        <ProfileInput
          v-model="email"
          label="Email"
          helper-text="This is what you use to sign in to Commander Spellbook. Only admins
          can see this value."
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
import DashboardSection from "@/components/dashboard/Section.vue";
import ProfileInput from "@/components/dashboard/ProfileInput.vue";

export default Vue.extend({
  components: {
    DashboardSection,
    ProfileInput,
  },
  layout: "dashboard",
  data() {
    const user = this.$store.getters["auth/user"];

    return {
      displayName: user.displayName,
      email: user.email,
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

      return this.$store.dispatch("auth/updateProfile", {
        displayName: this.displayName.trim(),
        email: this.email.trim(),
      });
    },
  },
});
</script>
