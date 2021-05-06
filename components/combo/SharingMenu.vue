<template>
  <div class="border-2 border-primary rounded-sm p-2">
    <!-- FontAwesome icons -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    />

    <!-- Vue Social Sharing renderless components (https://www.npmjs.com/package/vue-social-sharing) -->
    <ShareNetwork
      network="Twitter"
      :url="comboURL"
      title="insert combo title here!"
      hashtags="EDH,CommanderSpellbook"
    >
      <span>
        <i class="fa fa-twitter"></i>
        Twitter
      </span>
    </ShareNetwork>

    <ShareNetwork
      network="Reddit"
      :url="comboURL"
      title="Commander Spellbook Combo #__"
    >
      <span>
        <i class="fa fa-reddit-alien"></i>
        Reddit
      </span>
    </ShareNetwork>

    <ShareNetwork
      network="Facebook"
      :url="comboURL"
      title="Combo Title"
      description="lorum ipsum"
      quote="dolor sit amet"
      hashtags="CommanderSpellbook"
    >
      <span>
        <i class="fa fa-facebook-square"></i>
        Facebook
      </span>
    </ShareNetwork>

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

<style scoped>
a[class^="share-network-"] {
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

  @apply m-4 inline-block py-2 px-3 bg-transparent text-link border-2 border-primary rounded-sm no-underline;

  display: flex;
}

a[class^="share-network-"]:hover {
  @apply bg-link text-white border-link;
}

a[class^="share-network-"] span {
  padding: 0 10px;
  flex: 1 1 0%;
  font-weight: 500;
}

/*
a.share-network-twitter {
  background-color: #1da1f2;
}
*/
</style>
