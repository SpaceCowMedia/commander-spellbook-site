<template>
  <Error-Base
    :container-class="notFoundClass"
    main-message="Page Not Found"
    :sub-message="notFoundMessage"
  />
</template>

<script lang="ts">
import Vue from "vue";
import getRandomItemFromArray from "../lib/random-from-array";
import ErrorBaseComponent from "./error-base.vue";

const notFoundTemplates = [
  ["barren-glory", "You were looking for glory, but found an empty world."],
  ["curiosity", "How curious..."],
  ["lost-in-the-woods", "Must be lost in the woods."],
  ["one-with-nothing", "You were looking for one thing. You found... nothing."],
  ["possibility-storm", "So many possibilities... just not on this page."],
  ["totally-lost", "Looks like you're totally lost..."],
  ["unexpectedly-absent", "It was unexpectedly absent."],
  ["zhalfirin-void", "Must have phased out."],
];

export default Vue.extend({
  components: {
    "Error-Base": ErrorBaseComponent,
  },
  data() {
    return {
      notFoundClass: "",
      notFoundMessage: "",
    };
  },
  mounted() {
    const notFoundTemplate = getRandomItemFromArray(notFoundTemplates);

    this.notFoundClass = notFoundTemplate[0];
    this.notFoundMessage = notFoundTemplate[1];
  },
});
</script>

<style scoped>
.unexpectedly-absent {
  background-image: url("~assets/images/not-found-errors/unexpectedly-absent.jpg");
}

.zhalfirin-void {
  background-image: url("~assets/images/not-found-errors/zhalfirin-void.jpg");
}

.totally-lost {
  background-image: url("~assets/images/not-found-errors/totally-lost-art.jpg");
}

.curiosity {
  background-image: url("~assets/images/not-found-errors/curiosity-art.jpg");
}

.one-with-nothing {
  background-image: url("~assets/images/not-found-errors/one-with-nothing.jpg");
}

.lost-in-the-woods {
  background-image: url("~assets/images/not-found-errors/lost-in-the-woods.jpg");
}

.barren-glory {
  background-image: url("~assets/images/not-found-errors/barren-glory.jpg");
}

.possibility-storm {
  background-image: url("~assets/images/not-found-errors/possibility-storm.jpg");
}
</style>
