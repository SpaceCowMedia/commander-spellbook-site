<template>
  <div>
    <div class="spellbook-logo"></div>
    <h1 class="title">commander spellbook</h1>
    <h2 class="subtitle">Combo Database for EDH</h2>
  </div>
</template>

<style scoped>
.spellbook-logo {
  margin: auto;
  background: url("~assets/images/spellbook-art-crop.jpg");
  background-size: cover;
  background-position: center;
  @apply rounded-full overflow-hidden h-48 w-48;
}

.title {
  font-family: monospace;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
  @apply -mt-20;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
  @apply -mt-5;
}
</style>
