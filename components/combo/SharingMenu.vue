<template>
  <div>
    <head>
      <!-- Twitter -->
      <meta property="twitter:title" content="Commander Spellbook" />
      <meta property="twitter:description" content="Combo #__" />
      <meta
        property="twitter:image"
        content="img"
        src="Aeon Chronicler-Dan Dos Santos.jpg"
      />
      <meta property="twitter:card" content="summary_large_image" />

      <!-- Facebook/Reddit -->
      <meta property="og:title" content="Commander Spellbook" />
      <meta
        property="og:description"
        content="should probably write a function
      that populates this with a combo number, primary card, and primary result"
      />
      <meta
        property="og:image"
        content="img"
        src="Aeon Chronicler-Dan Dos Santos.jpg"
      />
    </head>

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
        const url = window.location.href;
        return url;
      }
    },
  },
});
</script>
