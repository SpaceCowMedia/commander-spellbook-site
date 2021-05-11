<template>
  <div class="border-t border-gray pt-2 mt-1">
    <div class="flex">
      <CopyComboLinkButton class="share-network">
        <div class="link-icon copy-icon">
          <div class="sr-only">Copy to Clipboard</div>
        </div>
      </CopyComboLinkButton>

      <div class="share-network">
        <ShareNetwork
          network="Twitter"
          :url="comboURL"
          title="insert combo title here!"
          hashtags="EDH,CommanderSpellbook"
        >
          <div class="link-icon twitter-icon">
            <div class="sr-only">Share on Twitter</div>
          </div>
        </ShareNetwork>
      </div>

      <div class="share-network">
        <ShareNetwork
          network="Reddit"
          :url="comboURL"
          title="Commander Spellbook Combo #__"
        >
          <div class="link-icon reddit-icon">
            <div class="sr-only">Share on Reddit</div>
          </div>
        </ShareNetwork>
      </div>

      <div class="share-network">
        <ShareNetwork
          network="Facebook"
          :url="comboURL"
          title="Combo Title"
          description="lorum ipsum"
          quote="dolor sit amet"
          hashtags="CommanderSpellbook"
        >
          <div class="link-icon facebook-icon">
            <div class="sr-only">Share on Facebook</div>
          </div>
        </ShareNetwork>
      </div>
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
    comboURL: () => {
      // window is undefined in node because it is a browser property
      if (typeof window !== "undefined") {
        return window.location.href;
      }
    },
  },
});
</script>

<style scoped>
.share-network {
  /* This is what I stole from the VSS docs as a reference point
  flex:none;
  color: #fff;
  background-color: #333;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-content: center;
  cursor: pointer;
  margin: 0 10px 0;
  text-decoration: none; */

  @apply flex py-2 px-3 bg-transparent text-link border-2 border-primary rounded-sm w-1/3 text-center mx-1 text-xl items-center justify-center;
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
.share-network:hover a {
  @apply text-white;
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

/*
a.share-network-twitter {
  background-color: #1da1f2;
}
*/
</style>
