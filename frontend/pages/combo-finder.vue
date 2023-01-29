<template>
  <div class="static-page">
    <ArtCircle card-name="Exploration" artist="Florian de Gesincourt" class="m-auto md:block hidden" />
    <h1 class="heading-title text-center">Find My Combos</h1>
    <h2 class="heading-subtitle text-center mt-0">
      Uncover combos in your deck, and discover potential combos.
    </h2>

    <section>
      <ol class="how-to-find-my-combo">
        <li>Paste your decklist</li>
        <li>Lists all available combos in your deck</li>
        <li>Lists all combos where you miss 1 combo piece</li>
      </ol>

      <textarea id="decklistInput" v-model="decklist" placeholder="Supported decklist formats:
Ancient Tomb
1 Ancient Tomb
1x Ancient Tomb
Ancient Tomb (uma) 236
" @input="lookupCombos">
      </textarea>

      <span id="decklist-card-count" v-if="decklist" class="gradient">{{
        numberOfCardsText
      }}</span>
      <button id="clear-decklist-input" v-if="decklist" class="button" @click="clearDecklist">
        Clear Decklist
      </button>

      <div v-if="!decklist" id="decklist-hint" class="heading-subtitle">
        Paste your decklist
      </div>
    </section>

    <div id="decklist-app">
      <section v-if="lookupInProgress">
        <h2 class="heading-subtitle">Loading Combos...</h2>
      </section>

      <section id="combos-in-deck-section" v-if="!lookupInProgress && decklist">
        <h2 class="heading-subtitle">{{ combosInDeckHeadingText }}</h2>

        <ComboResults :results="combosInDeck" />
      </section>

      <section id="potential-combos-in-deck-section" v-if="!lookupInProgress && potentialCombos.length > 0">
        <h2 class="heading-subtitle">{{ potentialCombosInDeckHeadingText }}</h2>
        <p>
          List of combos where your decklist is missing 1 combo piece. Toggle the
          color symbols to filter for identity.
        </p>

        <ColorIdentityPicker class="mb-4" :chosen-colors="potentialCombosColorIdentity"
          v-model="potentialCombosColorIdentity" />

        <ComboResults :results="potentialCombosMatchingColorIdentity" :missing-decklist-cards="missingDecklistCards" />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ArtCircle from "@/components/ArtCircle.vue";
import ComboResults from "@/components/search/ComboResults.vue";
import ColorIdentityPicker from "@/components/ColorIdentityPicker.vue";
import {
  findCombosFromDecklist,
  convertDecklistToDeck,
} from "@/lib/decklist-parser";

import type { FormattedApiResponse, ColorIdentityColors } from "@/lib/api/types";
import type Card from "@/lib/api/models/card";

type ComboFinderData = {
  decklist: string;
  numberOfCardsInDeck: number;
  lookupInProgress: boolean;
  combosInDeck: FormattedApiResponse[];
  potentialCombos: FormattedApiResponse[];
  missingDecklistCards: Card[];
  potentialCombosColorIdentity: ColorIdentityColors[];
};

const LOCAL_STORAGE_DECK_STORAGE_KEY =
  "commander-spellbook-combo-finder-last-decklist";

export default Vue.extend({
  components: {
    ArtCircle,
    ComboResults,
    ColorIdentityPicker,
  },
  data(): ComboFinderData {
    return {
      decklist: "",
      numberOfCardsInDeck: 0,
      lookupInProgress: false,
      combosInDeck: [],
      potentialCombos: [],
      missingDecklistCards: [],
      potentialCombosColorIdentity: ["w", "u", "b", "r", "g"]
    };
  },
  computed: {
    numberOfCardsText(): string {
      return `${this.numberOfCardsInDeck} ${this.$pluralize(
        "card",
        this.numberOfCardsInDeck
      )}`;
    },
    combosInDeckHeadingText(): string {
      const numOfCombos = this.combosInDeck.length;

      if (numOfCombos === 0) {
        return "No Combos Found";
      }

      return `${numOfCombos} ${this.$pluralize("Combo", numOfCombos)} Found`;
    },
    potentialCombosInDeckHeadingText(): string {
      const numOfCombos = this.potentialCombos.length;

      return `${numOfCombos} Potential ${this.$pluralize(
        "Combo",
        numOfCombos
      )} Found`;
    },
    potentialCombosMatchingColorIdentity(): FormattedApiResponse[] {
      return this.potentialCombos.filter((combo) => {
        return combo.colorIdentity.isWithin(this.potentialCombosColorIdentity);
      });
    }
  },
  mounted() {
    const savedDeck = localStorage.getItem(LOCAL_STORAGE_DECK_STORAGE_KEY);

    if (savedDeck?.trim()) {
      this.decklist = savedDeck;
      this.lookupCombos();
    }
  },
  methods: {
    async lookupCombos() {
      const deck = convertDecklistToDeck(this.decklist);
      this.numberOfCardsInDeck = deck.numberOfCards;

      this.combosInDeck = [];
      this.potentialCombos = [];
      this.missingDecklistCards = [];
      this.lookupInProgress = true;

      // not possible to have any combos if deck has 1
      // or fewer card in it, so we can skip the lookup
      if (this.numberOfCardsInDeck < 2) {
        this.lookupInProgress = false;
        return;
      }

      localStorage.setItem(LOCAL_STORAGE_DECK_STORAGE_KEY, this.decklist);

      // TODO: let's debounce in case some weirdo is manually
      // typing in their deck list
      const combos = await findCombosFromDecklist(deck.cards);

      this.combosInDeck = combos.combosInDecklist;
      this.potentialCombos = combos.potentialCombos;
      this.missingDecklistCards = combos.missingCardsForPotentialCombos;

      this.lookupInProgress = false;
    },

    clearDecklist() {
      this.decklist = "";
      this.combosInDeck = [];
      this.potentialCombos = [];
      localStorage.removeItem(LOCAL_STORAGE_DECK_STORAGE_KEY);
    },
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
  @apply cursor-pointer;
}

#decklist-card-count {
  @apply border-2 border-dark w-1/3 text-center py-2 -mt-4;
}

#decklist-app {
  @apply py-4;
}

#decklist-hint {
  @apply flex relative text-center items-center justify-center flex-col -my-10 mb-8;
}

#decklist-hint::before {
  content: "";
  height: 90px;
  width: 20px;
  background-image: url("~assets/svgs/combo-finder-arrow-hint.svg");

  @apply block bg-center bg-no-repeat bg-contain;
}
</style>
