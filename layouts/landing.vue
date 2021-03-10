<template>
  <div>
    <BetaMask>
      <main>
        <Nuxt />
      </main>
      <Footer />
    </BetaMask>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import BetaMask from "@/components/BetaMask.vue";
import Footer from "@/components/Footer.vue";

export default Vue.extend({
  components: {
    BetaMask,
    Footer,
  },
});
</script>
