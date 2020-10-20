<template>
  <Error-Base
    :container-class="unknownErrorClass"
    main-message="Uh Oh"
    sub-message="Something went wrong. Try again in a few minutes."
  />
</template>

<script lang="ts">
import Vue from 'vue'
import getRandomItemFromArray from '../lib/random-from-array'
import ErrorBaseComponent from './error-base.vue'

const backgroundOptions = ['apocalypse', 'obliterate']

export default Vue.extend({
  components: {
    'Error-Base': ErrorBaseComponent,
  },
  data() {
    return {
      unknownErrorClass: '',
    }
  },
  mounted() {
    this.unknownErrorClass = getRandomItemFromArray(backgroundOptions)
  },
})
</script>

<style scoped>
.apocalypse {
  background-image: url('~assets/images/unknown-errors/apocalypse.jpg');
}

.obliterate {
  background-image: url('~assets/images/unknown-errors/obliterate.jpg');
}
</style>
