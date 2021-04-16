<template>
  <div>
    <button>
      <ShareNetwork
        network="Twitter"
        :url="comboURL"
        title="insert combo title here!"
        hashtags="EDH,CommanderSpellbook"
      >
        <span> Twitter </span>
      </ShareNetwork>
    </button>

    <button>
      <ShareNetwork
        network="Reddit"
        :url="comboURL"
        title="Commander Spellbook Combo #__"
      >
        Reddit
      </ShareNetwork>
    </button>

    <button>
      <ShareNetwork
        network="Facebook"
        :url="comboURL"
        title="Combo Title"
        description="lorum ipsum"
        quote="dolor sit amet"
        hashtags="CommanderSpellbook"
      >
        Facebook
      </ShareNetwork>
    </button>

    <CopyComboLinkButton :combo-link="comboLink" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueSocialSharing from "vue-social-sharing";
import CopyComboLinkButton from "@/components/combo/CopyComboLinkButton.vue";

Vue.use(VueSocialSharing);

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
    comboURL: () => {
      // window is undefined in node because it is a browser property
      if (typeof window !== "undefined") {
        return window.location.href;
      }
    },
  },
});
</script>
