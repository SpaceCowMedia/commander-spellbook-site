<template>
  <div>
    <BetaMask>
      <div class="bg-gray-200">
        <nav class="container">
          <SearchBar />
        </nav>
      </div>
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
import SearchBar from "@/components/SearchBar.vue";
import Footer from "@/components/Footer.vue";

export default Vue.extend({
  components: {
    SearchBar,
    BetaMask,
    Footer,
  },
});
</script>
