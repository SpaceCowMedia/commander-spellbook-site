<template>
  <div class="max-w-full -mb-56">
    <NotFoundError v-if="error.statusCode === 404" />
    <UnknownError v-else />
  </div>
</template>

<script lang="ts">
import NotFoundError from "@/components/errors/NotFoundError.vue";
import UnknownError from "@/components/errors/UnknownError.vue";

export default {
  components: {
    NotFoundError,
    UnknownError,
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
