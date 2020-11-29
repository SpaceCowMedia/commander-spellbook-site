<template>
  <div>
    <div class="container">
      <div class="w-full">
        <Logo />

        <SearchBar class="md:w-2/3 h-20" inputClass="text-2xl text-center" />

        <div class="links">
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
import Vue from 'vue'

export default Vue.extend({
  mounted() {
    const query = this.$route.query.q

    if (!(typeof query === 'string')) {
      return
    }

    if (Number(query) > 0) {
      this.$router.push(`/combo/${query}`)
      return
    }

    if (query === 'spoiled') {
      this.$router.push('/search?q=is:spoiled')
      return
    }

    if (query === 'banned') {
      this.$router.push('/search?q=is:banned')
      return
    }

    this.$router.push(`/search?q=${query}`)
  },
})
</script>

<style scoped>
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
.container {
  margin: 0 auto;
  min-height: 100vh;
  @apply flex flex-col items-center justify-center text-center;
}
</style>
