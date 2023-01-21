<template>
  <div class="static-page">
    <ArtCircle
      card-name="Exploration"
      artist="Florian de Gesincourt"
      class="m-auto md:block hidden"
    />
    <h1 class="heading-title text-center">Find My Combos</h1>
    <h2 class="heading-subtitle text-center mt-0">
      Uncover combos in your deck, and discover potential combos.
    </h2>

    <section>
      <ol class="how-to-find-my-combo">
        <li>Paste your decklist</li>
        <li>Lists all available combos of your deck</li>
        <li>Lists all combos where you miss 1 combo piece</li>
      </ol>

      <textarea
        id="decklistInput"
        placeholder="Supported decklist formats:
Ancient Tomb
1 Ancient Tomb
1x Ancient Tomb
Ancient Tomb (uma) 236
"
      >
      </textarea>

      <span id="decklist-card-count" class="gradient"></span>
      <div id="clear-decklist-input" class="button">Clear Decklist</div>
    </section>

    <div id="decklist-app">
      <div class="hint heading-subtitle">Paste your decklist</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ArtCircle from "@/components/ArtCircle.vue";
import { DecklistComboFinder } from "@/components/DecklistComboFinder.js";

export default Vue.extend({
  components: {
    ArtCircle,
  },
  mounted() {
    DecklistComboFinder();
  },
});
</script>

<style scoped>
p {
  @apply my-4;
}

section {
  @apply flex flex-col items-center justify-center py-4;
}

section .how-to-find-my-combo li {
  counter-increment: numCounter;

  @apply mb-2 flex items-center;
}

section .how-to-find-my-combo li::before {
  content: counter(numCounter);

  @apply inline-flex flex-shrink-0 justify-center items-center bg-dark text-white mr-2 pt-1 font-extrabold h-8 w-8 rounded-full font-title;
}

textarea {
  @apply h-80 w-2/3 py-2 px-4 pb-6 mt-4 border-2 border-dark resize-none;
}

textarea:active {
  @apply border-primary;
}

textarea:focus {
  @apply border-primary;
}

#clear-decklist-input {
  @apply hidden cursor-pointer;
}

#decklist-card-count {
  @apply hidden border-2 border-dark w-1/3 text-center py-2 -mt-4;
}

#decklist-app {
  @apply py-8;
}

#decklist-app .hint {
  @apply flex relative text-center items-center justify-center flex-col -my-24 mb-8;
}

#decklist-app .hint::before {
  content: "";
  height: 90px;
  width: 20px;
  background-image: url("~assets/svgs/combo-finder-arrow-hint.svg");

  @apply block bg-center bg-no-repeat bg-contain;
}
</style>
