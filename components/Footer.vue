<template>
  <footer class="container footer md:flex flex-row w-full">
    <div class="flex-grow">
      <nuxt-link to="/syntax-guide"> Syntax Guide </nuxt-link>
    </div>
    <div class="flex-grow">
      <nuxt-link to="/privacy-policy"> Privacy Policy </nuxt-link>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: rgb(92, 126, 159);
  @apply w-full h-10 p-10 text-center;
}
</style>
