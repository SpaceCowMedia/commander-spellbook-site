<template>
  <div>
    <div class="container">
      <div class="w-full">
        <Logo />
        <div class="w-full flex">
          <div class="w-1/6"></div>
          <input
            type="text"
            class="main-search-input"
            placeholder="Search xxxxx combos"
          />
        </div>
        <div class="links">
          <nuxt-link to="/todo" class="button--red">
            Advanced Search
          </nuxt-link>
          <nuxt-link to="/todo" class="button--red"> Syntax Guide </nuxt-link>
          <nuxt-link to="/todo" class="button--red"> Random Combo </nuxt-link>
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
.main-search-input {
  @apply appearance-none block w-4/6 h-20 bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight text-lg;
}

.main-search-input:focus {
  @apply outline-none bg-white border-gray-500;
}

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
