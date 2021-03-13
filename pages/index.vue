<template>
  <div class="relative gradient pb-40 md:pb-8">
    <div class="container relative md:h-screen z-10">
      <div class="w-full">
        <Logo />

        <SearchBar :on-home-page="true" class="bg-white mt-4 md:w-2/3 h-20" />

        <div class="links md:block flex flex-col">
          <nuxt-link to="/advanced-search" class="button">
            Advanced Search
          </nuxt-link>
          <nuxt-link to="/syntax-guide" class="button">
            Syntax Guide
          </nuxt-link>
          <nuxt-link to="/random" class="random-button button">
            Random Combo
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import SearchBar from "@/components/SearchBar.vue";
import Logo from "@/components/Logo.vue";

export default Vue.extend({
  components: {
    SearchBar,
    Logo,
  },
  layout: "landing",
  mounted() {
    const query = this.$route.query.q;
    const { status, id } = this.$route.query;

    if (Number(query) > 0 || Number(id) > 0) {
      this.$router.push(`/combo/${id || query}`);
      return;
    }

    if (query === "spoiled" || status === "spoiled") {
      this.$router.push("/search?q=is:spoiled");
      return;
    }

    if (query === "banned" || status === "banned") {
      this.$router.push("/search?q=is:banned");
      return;
    }

    if (!(typeof query === "string")) {
      return;
    }

    this.$router.push(`/search?q=${query}`);
  },
});
</script>

<style scoped>
.container {
  @apply flex flex-col items-center justify-center text-center m-auto;
}

.gradient {
  @apply bg-gradient-to-r from-primary to-secondary;
}

.button {
  @apply bg-dark text-white;
}

.button:hover {
  @apply bg-secondary text-dark;
}
</style>
