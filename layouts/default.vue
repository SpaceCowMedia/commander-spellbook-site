<template>
  <div>
    <Nuxt />
    <footer class="footer">Secondary navigation links go here</footer>
  </div>
</template>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.button--red {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid rgb(141, 54, 34);
  color: rgb(141, 54, 34);
  text-decoration: none;
  padding: 10px 30px;
  @apply mb-4 mt-4;
}

.button--red:hover {
  color: #fff;
  background-color: rgb(141, 54, 34);
}

.heading-title {
  font-family: monospace;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  @apply text-4xl;
}

@media (min-width: 640px) {
  .heading-title {
    @apply text-6xl mb-4;
  }
}

.footer {
  background: rgb(92, 126, 159);
  @apply w-full h-10 p-10 text-center;
}
</style>
