<template>
  <div>
    <div class="container md:h-screen">
      <div class="w-full">
        <Logo />

        <SearchBar :on-home-page="true" class="md:w-2/3 h-20" />

        <div class="links md:block flex flex-col">
          <nuxt-link to="/advanced-search" class="button--red">
            Advanced Search
          </nuxt-link>
          <nuxt-link to="/syntax-guide" class="button--red">
            Syntax Guide
          </nuxt-link>
          <nuxt-link to="/random" class="button--red"> Random Combo </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  layout: "landing",
  mounted() {
    const query = this.$route.query.q;
    const status = this.$route.query.status;

    if (!(typeof query === "string")) {
      return;
    }

    if (Number(query) > 0) {
      this.$router.push(`/combo/${query}`);
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

    this.$router.push(`/search?q=${query}`);
  },
});
</script>

<style scoped>
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
.container {
  @apply flex flex-col items-center justify-center text-center m-auto;
}
</style>
