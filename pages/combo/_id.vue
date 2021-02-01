<template>
  <div>
    <CardHeader :cards-art="cardArts" :title="title" />

    <div class="container md:flex flex-row">
      <div class="w-full sm:w-2/3">
        <ComboList
          title="Cards"
          :iterations="cardNames"
          :is-card="true"
          :cards-in-combo="cardNames"
        />
        <ComboList
          title="Prerequisites"
          :iterations="prerequisites"
          :cards-in-combo="cardNames"
        />
        <ComboList
          title="Steps"
          :show-numbers="true"
          :iterations="steps"
          :cards-in-combo="cardNames"
        />
        <ComboList
          title="Results"
          :iterations="results"
          :cards-in-combo="cardNames"
        />
      </div>

      <div class="w-full sm:w-1/3 text-center">
        <div class="my-4">
          <ColorIdentity :colors="colorIdentity" />
        </div>

        <div v-if="hasBannedCard" class="banned-warning">
          WARNING: Combo contains cards that are banned in Commander
        </div>

        <div v-if="hasSpoiledCard" class="spoiled-warning">
          WARNING: Combo contains cards that are from a forthcoming set (and not
          yet legal in Commander)
        </div>

        <ComboSidebarLinks
          :combo-id="comboNumber"
          :combo-link="link"
          :cards="cardNames"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import spellbookApi from "commander-spellbook";

type CardData = {
  name: string;
  oracleImageUrl: string;
  artUrl: string;
};

type ComboData = {
  title: string;
  hasBannedCard: boolean;
  hasSpoiledCard: boolean;
  link: string;
  loaded: boolean;
  comboNumber: string;
  cards: CardData[];
  colorIdentity: string[];
  prerequisites: string[];
  steps: string[];
  results: string[];
};

export default Vue.extend({
  async asyncData({ params }): Promise<ComboData | void> {
    const comboNumber = params.id;
    let combo;

    try {
      combo = await spellbookApi.findById(comboNumber);
    } catch (err) {
      // TODO redirect to 404 page??
      return;
    }

    const cards = combo.cards.map((card: any) => {
      return {
        name: card.name,
        artUrl: card.getScryfallImageUrl("art_crop"),
        oracleImageUrl: card.getScryfallImageUrl(),
      };
    });

    return {
      comboNumber,
      title: `Combo Number ${comboNumber}`,
      hasBannedCard: combo.hasBannedCard,
      hasSpoiledCard: combo.hasSpoiledCard,
      link: combo.permalink,
      cards,
      loaded: true,
      prerequisites: Array.from(combo.prerequisites),
      steps: Array.from(combo.steps),
      results: Array.from(combo.results),
      colorIdentity: Array.from(combo.colorIdentity.colors),
    };
  },
  data(): ComboData {
    return {
      title: "Looking up Combo",
      hasBannedCard: false,
      hasSpoiledCard: false,
      link: "",
      loaded: false,
      comboNumber: "0",
      cards: [],
      colorIdentity: [],
      prerequisites: [],
      steps: [],
      results: [],
    };
  },
  computed: {
    cardNames(): string[] {
      return this.cards.map((c) => c.name);
    },
    cardArts(): string[] {
      return this.cards.map((c) => c.artUrl);
    },
  },
  mounted() {
    if (!this.loaded) {
      this.$router.push({
        path: "/combo-not-found",
      });
    }
  },
  methods: {},
});
</script>

<style>
.title {
  font-family: monospace;
  font-weight: 300;
  font-size: 50px;
  color: #35495e;
  letter-spacing: 1px;
}

.banned-warning {
  @apply text-red-500 font-semibold;
}

.spoiled-warning {
  @apply font-semibold;
}
</style>
