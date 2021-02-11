<template>
  <footer class="footer">
    <div class="container md:flex flex-row">
      <div class="flex-grow">
        <nuxt-link to="/syntax-guide"> Syntax Guide </nuxt-link>
      </div>
      <div class="flex-grow">
        <nuxt-link to="/privacy-policy"> Privacy Policy </nuxt-link>
      </div>
    </div>
    <AnalyticsCookieBanner />
  </footer>
</template>

<style scoped>
.footer {
  background: rgb(92, 126, 159);

  /* ensures that the cookie banner does not fully cover up footer
    may not need this once the links are fully created */
  min-height: 300px;
  @apply w-full h-10 p-10 text-center;
}
</style>
