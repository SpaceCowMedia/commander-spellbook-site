<template>
  <div class="static-page">
    <ArtCircle card-name="Exploration" artist="Florian de Gesincourt" class="m-auto md:block hidden" />
    <h1 class="heading-title text-center">Find My Combo</h1>
    <h2 class="heading-subtitle text-center mt-0">
      Companion tool that helps you uncover combos in your deck, and discover potential combos.
    </h2>

    <section>
      <ol class="how-to-find-my-combo">
        <li>Paste your decklist</li>
        <li>Lists all available combos of your deck</li>
        <li>Lists all combos where you miss 1 combo piece</li>
      </ol>

      <textarea id="decklistInput" placeholder="Supported decklist formats:
Ancient Tomb
1 Ancient Tomb
1x Ancient Tomb
Ancient Tomb (uma) 236
">
</textarea>

      <span id="decklist-card-count" class="gradient"></span>
      <div id="clear-decklist-input" class="button">Clear Decklist</div>
    </section>

    <div id="decklist-app">
      <div class="hint heading-subtitle">
        Paste your decklist
      </div>
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
  }
});
</script>

<style scoped>
p {
  @apply my-4;
}

section {
  padding: 32px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 24px;
}

section .how-to-find-my-combo {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: numCounter;
}

section .how-to-find-my-combo li {
  display: flex;
  align-items: center;
  counter-increment: numCounter;
  margin-bottom: 8px;
}

section .how-to-find-my-combo li::before {
  background: #222;
  color: #fff;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 99px;
  width: 28px;
  height: 28px;
  padding: 4px 0 0;
  font-weight: 800;
  margin-right: 10px;
  content: counter(numCounter);
  flex-shrink: 0;
  font-family: 'Josefin Sans', sans-serif;
}


textarea {
  height: 142px;
  width: 440px;
  max-width: 100%;
  padding: 8px 16px;
  font-size: 16px;
  margin-top: 16px;
  border-color: #222;
  border-radius: 0.125rem;
  border-width: 2px;
  resize: none;
  outline: none;
}

textarea:active {
  border-color: #222;
}

textarea:focus {
  border-color: #222;
}
</style>

<style>






#clear-decklist-input {
  display: none;
  cursor: pointer;
}



#decklist-card-count {
  display: none;
  margin-top: -26px;
  border: 2px solid #222;
  width: 440px;
  max-width: 100%;
  text-align: center;
  padding: 4px 0;
}

#decklist-app {
  padding: 32px 0;
}

#decklist-app .hint {
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: -36px 0 32px;
  gap: 16px;
}

#decklist-app .hint::before {
  content: "";
  display: block;
  height: 90px;
  width: 20px;
  background-image: url("~assets/svgs/combo-finder-arrow-hint.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

#decklist-app h2 {
  margin-bottom: 24px;
}

#decklist-app h2.potential-combos-headline {
  margin: 96px 0 6px;
}

#decklist-app p.potential-combos-description {
  margin: 0 0 24px;
}

details {
  margin-bottom: 16px;
  overflow: hidden;
  border-color: #222;
  border-radius: 0.125rem;
  border-width: 2px;
}

details summary {
  list-style: none;
  width: 100%;
  cursor: pointer;
}

details summary::-webkit-details-marker {
  display: none;
}

details summary h3 {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  margin-bottom: 16px;
  background: #222;
  color: #fff;
}

details summary .card-images {
  display: flex;
  gap: 12px;
  overflow-X: auto;
  padding: 0 16px 16px;
  width: 100%;
}

.color-filter label img {
  width: 44px;
  height: 44px;
  border-radius: 22px;
}

details summary .card-images img {
  width: 148px;
  border-radius: 8px;
  background: #363a44;
}

details summary .card-images img.missing {
  opacity: .8;
  filter: grayscale(1);
  box-sizing: border-box;
  border-radius: 11px;
}

details .combo-details {
  padding: 0 16px;
}

details .combo-details h4 {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 700;
}

details .combo-details ul {
  margin: 0 0 32px;
}

details .combo-details ol {
  margin: 0 0 32px;
  list-style-type: decimal;
  list-style-position: inside;
}

details .combo-details ul li {
  margin-bottom: 6px;
}

details .combo-details ol li {
  margin-bottom: 6px;
}


details[open] .card-images img {
  width: 240px;
  border-radius: 11px;
  gap: 16px;
}

details .combo-details span.symbol {
  display: inline-block;
  width: 17px;
  height: 14px;
  position: relative;
  margin-right: 2px;
}

details .combo-details span.symbol img {
  position: absolute;
}

.color-filter {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 48px;
}

.color-filter input {
  display: none;
}

.color-filter label {
  cursor: pointer;
  opacity: 0.2;
  transition: 0.3s ease;
}

.color-filter input:checked+label {
  opacity: 1;
}
</style>
