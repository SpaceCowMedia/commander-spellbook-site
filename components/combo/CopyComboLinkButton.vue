<template>
  <div>
    <button
      id="copy-combo-button"
      ref="copyButton"
      class="button w-full"
      type="button"
      @click="copyComboLink"
    >
      Copy Combo Link
    </button>

    <!-- accessibility compliance software may see this as an
      issue since there is no label for it. But it's hidden
      from screenreaders and hidden on the page. It only needs
      to be a text input in order to make the copy code work -->
    <input
      ref="copyInput"
      aria-hidden="true"
      type="hidden"
      class="hidden-combo-link-input"
      :value="comboLink"
    />
    <!-- This is a bit convoluated, but to get the notification we want
    to animate correctly, we it to be always on screen (but out of frame)
    to slide up from the bottom, screen readers need it to appear to read
    the message to the user. Therfore, we have 2 version, one that is not
    visible in the UI but alerts the user with a screenreader, and one
    that is visible in the UI, but is hidden to screen readers. -->
    <div v-if="showCopyNotification" role="alert" class="sr-only">
      Combo link copied to your clipboard
    </div>
    <div
      aria-hidden="true"
      class="copy-combo-notification w-full md:w-1/2"
      :class="{ show: showCopyNotification }"
    >
      Combo link copied to your clipboard!
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueSocialSharing from "vue-social-sharing";

Vue.use(VueSocialSharing);

export default Vue.extend({
  props: {
    comboLink: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      showCopyNotification: false,
    };
  },
  methods: {
    copyComboLink(): void {
      // kind of convoluted, but the hidden input needs to be
      // text so we can actually copy from it, but when it's
      // text, accessibility programs flag it for not having a label
      // or being usable, even when set to aria-hidden, so we quickly
      // set it to text and back to hidden again
      const copyInput = this.$refs.copyInput as HTMLInputElement;
      copyInput.type = "text";
      copyInput.select();
      document.execCommand("copy");
      copyInput.type = "hidden";

      this.showCopyNotification = true;
      this.$gtag.event("Copy Combo Link Clicked", {
        event_category: "Combo Detail Page Actions",
      });

      setTimeout(() => {
        this.showCopyNotification = false;
      }, 2000);

      window.requestAnimationFrame(() => {
        (this.$refs.copyButton as HTMLButtonElement).blur();
      });
    },
  },
});
</script>

<style scoped>
.hidden-combo-link-input {
  left: -25%;
  top: -25%;
  @apply fixed;
}

.copy-combo-notification {
  /* Tailwind 2 class: -bottom-20 */
  bottom: -5rem;
  @apply transition-all duration-1000 fixed left-0 right-0 m-auto p-4 bg-black text-white;
}

.copy-combo-notification.show {
  /* Tailwind 2 class: bottom-4 */
  bottom: 1rem;
}
</style>
