<template>
  <Error-Template
    :containerClass="unknownErrorClass"
    mainMessage="Uh Oh"
    subMessage="Something went wrong. Try again in a few minutes."
  />
</template>

<script lang="typescript">
import ErrorTemplateComponent from "./error-template";

const backgroundOptions = [
  'apocalypse',
  'obliterate',
]

export default {
  components: {
    'Error-Template': ErrorTemplateComponent
  },
  data() {
    return {
      unknownErrorClass: '',
    }
  },
  mounted() {
    this.unknownErrorClass =
      backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)]
  },
}
</script>

<style scoped>
.apocalypse {
  background-image: url('~assets/images/unknown-errors/apocalypse.jpg');
}
.obliterate {
  background-image: url('~assets/images/unknown-errors/obliterate.jpg');
}
</style>
