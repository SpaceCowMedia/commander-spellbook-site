<template>
  <div class="border-t border-gray pt-2 mt-1">
    <div class="flex">
      <CopyComboLinkButton
        v-tooltip.bottom="'Copy Combo Link to Clipboard'"
        class="button share-network"
        :combo-link="comboLink"
      >
        <div class="link-icon copy-icon">
          <div class="sr-only">Copy to Clipboard</div>
        </div>
      </CopyComboLinkButton>

      <ShareNetwork
        v-tooltip.bottom="'Share Combo on Twitter'"
        class="button share-network"
        network="Twitter"
        :url="comboLink"
        :title="text"
        :hashtags="hashtags"
        tag="button"
        twitter-user="CommanderSpell"
        @open="onOpen('Twitter')"
      >
        <div class="link-icon twitter-icon"></div>
      </ShareNetwork>

      <ShareNetwork
        v-tooltip.bottom="'Share Combo on Reddit'"
        class="button share-network"
        network="Reddit"
        :url="comboLink"
        :title="text"
        tag="button"
        @open="onOpen('Reddit')"
      >
        <div class="link-icon reddit-icon"></div>
      </ShareNetwork>

      <ShareNetwork
        v-tooltip.bottom="'Share Combo on Facebook'"
        class="button share-network"
        network="Facebook"
        :url="comboLink"
        :title="text"
        :hashtags="hashtags"
        tag="button"
        @open="onOpen('Facebook')"
      >
        <div class="link-icon facebook-icon"></div>
      </ShareNetwork>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import CopyComboLinkButton from "@/components/combo/CopyComboLinkButton.vue";

export default Vue.extend({
  components: {
    CopyComboLinkButton,
  },
  props: {
    comboLink: {
      type: String,
      default: "",
    },
  },
  computed: {
    hashtags(): string {
      return "commanderspellbook";
    },
    text(): string {
      return "Check out this combo!";
    },
  },
  methods: {
    onOpen(network: string): void {
      this.$gtag.event(`Share on ${network}`, {
        event_category: "Combo Detail Page Actions",
      });
    },
  },
});
</script>

<style scoped>
.share-network.button {
  @apply flex items-center justify-center w-1/3 text-center mx-1 mt-1 text-xl;
}

.share-network:first-child {
  @apply ml-0;
}

.share-network:last-child {
  @apply mr-0;
}

.share-network a {
  @apply no-underline;
}

.share-network:hover {
  @apply bg-link text-white border-link;
}

.link-icon {
  @apply bg-link h-6 w-6 m-auto;
}

.share-network:hover .link-icon {
  @apply bg-white;
}

.twitter-icon {
  -webkit-mask: url("~assets/svgs/twitter-square-brands.svg") no-repeat center;
  mask: url("~assets/svgs/twitter-square-brands.svg") no-repeat center;
}

.facebook-icon {
  -webkit-mask: url("~assets/svgs/facebook-square-brands.svg") no-repeat center;
  mask: url("~assets/svgs/facebook-square-brands.svg") no-repeat center;
}

.reddit-icon {
  -webkit-mask: url("~assets/svgs/reddit-square-brands.svg") no-repeat center;
  mask: url("~assets/svgs/reddit-square-brands.svg") no-repeat center;
}

.copy-icon {
  -webkit-mask: url("~assets/svgs/link-solid.svg") no-repeat center;
  mask: url("~assets/svgs/link-solid.svg") no-repeat center;
  @apply h-5 w-5;
}
</style>
