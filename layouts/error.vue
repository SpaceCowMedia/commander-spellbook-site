<template>
  <div class="max-w-full -mb-56">
    <Not-Found-Error v-if="error.statusCode === 404" />
    <Unknown-Error v-else />
  </div>
</template>

<script lang="ts">
import NotFoundErrorComponent from "../components/errors/not-found.vue";
import UnknownErrorComponent from "../components/errors/unknown.vue";

export default {
  components: {
    "Not-Found-Error": NotFoundErrorComponent,
    "Unknown-Error": UnknownErrorComponent,
  },
  props: {
    error: {
      type: Object,
      default() {
        return {
          statusCode: 500,
        };
      },
    },
  },
};
</script>
