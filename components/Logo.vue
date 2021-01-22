<template>
  <div class="mt-4 md:mt-0">
    <ArtCircle
      class="m-auto"
      :size="12"
      card-name="Spellbook"
      artist="Ciruelo"
    />
    <h1 class="title text-5xl md:text-6xl -mt-6 md:-mt-9 xl:-mt-14">
      commander spellbook
    </h1>
    <h2 class="subtitle text-3xl xl:text-5xl">Combo Database for EDH</h2>
  </div>
</template>

<style scoped>
.spellbook-logo {
  background: url("~assets/images/spellbook-art-crop.jpg");
  @apply rounded-full overflow-hidden m-auto bg-cover bg-center;
}

.title {
  font-family: monospace;
  color: #35495e;
  @apply tracking-wide font-light block mb-6;
}

.subtitle {
  color: #526488;
  @apply -mt-5 font-light pb-2;
}

@media (min-width: 1280px) {
  .title {
    /* this is actually text-8xl, but the current verson of Nuxt doesn't support it */
    font-size: 6rem;
  }
}
</style>
