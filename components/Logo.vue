<template>
  <div class="mt-4 md:mt-0 text-center">
    <img
      src="~/assets/images/logo.svg"
      class="h-32 inline-block md:h-48 lg:h-56"
    />
    <img
      src="~/assets/images/title.svg"
      class="h-32 inline-block md:h-48 lg:h-56"
    />
  </div>
</template>

<style scoped>
.spellbook-logo {
  background: url("~assets/images/full-logo.svg");
  @apply m-auto bg-contain bg-center bg-no-repeat w-full;
}

@media (min-width: 1280px) {
  .title {
    /* this is actually text-8xl, but the current verson of Nuxt doesn't support it */
    font-size: 6rem;
  }
}
</style>
