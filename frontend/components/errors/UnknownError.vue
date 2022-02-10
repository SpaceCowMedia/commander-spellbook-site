<template>
  <ErrorBase
    :container-class="unknownErrorClass"
    main-message="Uh Oh"
    sub-message="Something went wrong. Try again in a few minutes."
  />
</template>

<script lang="ts">
import Vue from "vue";
import ErrorBase from "./ErrorBase.vue";
import getRandomItemFromArray from "@/lib/random-from-array";

const backgroundOptions = ["apocalypse", "obliterate", "book-burning"];

export default Vue.extend({
  components: {
    ErrorBase,
  },
  data() {
    return {
      unknownErrorClass: "",
    };
  },
  mounted() {
    this.unknownErrorClass = getRandomItemFromArray(backgroundOptions);
  },
});
</script>

<style scoped>
.apocalypse {
  background-image: url("~assets/images/unknown-errors/apocalypse.jpg");
}

.obliterate {
  background-image: url("~assets/images/unknown-errors/obliterate.jpg");
}

.book-burning {
  background-image: url("~assets/images/unknown-errors/book-burning.jpg");
}
</style>
