<template>
  <div class="max-w-full">
    <Not-Found-Error v-if="error.statusCode === 404" />
    <Unknown-Error v-else />
  </div>
</template>

<script lang="typescript">
import NotFoundErrorComponent from "../components/errors/not-found.vue";
import UnknownErrorComponent from "../components/errors/unknown.vue";

export default {
  props: ['error'],
  components: {
    'Not-Found-Error': NotFoundErrorComponent,
    'Unknown-Error': UnknownErrorComponent
  },
}
</script>
