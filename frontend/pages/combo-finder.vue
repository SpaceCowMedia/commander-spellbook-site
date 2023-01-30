<template>
  <div class="static-page">
    <ArtCircle card-name="Exploration" artist="Florian de Gesincourt" class="m-auto md:block hidden" />
    <h1 class="heading-title text-center">Find My Combos</h1>
    <h2 class="heading-subtitle text-center mt-0">
      Uncover combos in your deck, and discover potential combos.
    </h2>

    <label for="decklist-input" class="sr-only">Copy and paste your decklist into the text box to discover the combos in
      your deck.</label>

    <section>
      <textarea id="decklist-input" v-model="decklist" placeholder="Supported decklist formats:
Ancient Tomb
1 Ancient Tomb
1x Ancient Tomb
Ancient Tomb (uma) 236
" @input="onInput">
      </textarea>

      <span v-if="decklist" id="decklist-card-count" class="gradient" aria-hidden="true">{{
        numberOfCardsText
      }}</span>
      <button v-if="decklist" id="clear-decklist-input" class="button" @click="clearDecklist">
        Clear Decklist
      </button>

      <div v-if="!decklist" id="decklist-hint" class="heading-subtitle" aria-hidden="true">
        Paste your decklist
      </div>
    </section>

    <div id="decklist-app">
      <section v-if="lookupInProgress">
        <h2 class="heading-subtitle">Loading Combos...</h2>
      </section>

      <section v-if="!lookupInProgress && decklist" id="combos-in-deck-section">
        <h2 class="heading-subtitle">{{ combosInDeckHeadingText }}</h2>

        <ComboResults :results="combosInDeck" />
      </section>

      <section v-if="!lookupInProgress && potentialCombos.length > 0" id="potential-combos-in-deck-section">
        <h2 class="heading-subtitle">{{ potentialCombosInDeckHeadingText }}</h2>
        <p>
          List of combos where your decklist is missing 1 combo piece. Toggle the
          color symbols to filter for identity.
        </p>

        <ColorIdentityPicker v-model="potentialCombosColorIdentity" class="mb-4"
          :chosen-colors="potentialCombosColorIdentity" />

        <ComboResults :results="potentialCombosMatchingColorIdentity" :missing-decklist-cards="missingDecklistCards" />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import debounce from "debounce";
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
    onInput: debounce(function () {
      // @ts-ignore
      this.lookupCombos();
    }, 200),
    async lookupCombos() {
      const deck = await convertDecklistToDeck(this.decklist);
      this.numberOfCardsInDeck = deck.numberOfCards;

      this.combosInDeck = [];
      this.potentialCombos = [];
      this.missingDecklistCards = [];
      this.potentialCombosColorIdentity = deck.colorIdentity;
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

#decklist-input {
  @apply h-80 w-full py-2 px-4 pb-6 mt-4 border-2 border-dark resize-none;
}

#decklist-input:active {
  @apply border-primary;
}

#decklist-input:focus {
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

@media (min-width: 768px) {
  #decklist-input {
    @apply w-2/3;
  }
}
</style>
