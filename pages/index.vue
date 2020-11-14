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

export default Vue.extend({})
</script>

<style>
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

.links {
  padding-top: 15px;
}
</style>
