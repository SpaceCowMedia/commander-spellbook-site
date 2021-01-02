<template>
  <div>
    <SearchBar />

    <CardHeader :cards-art="cardArts" :title="title" />

    <div class="container max-w-5xl mx-auto md:flex flex-row">
      <div class="w-2/3">
        <ComboList title="Cards" :iterations="cardNames" />
        <ComboList title="Prerequisites" :iterations="prerequisites" />
        <ComboList title="Steps" :show-numbers="true" :iterations="steps" />
        <ComboList title="Results" :iterations="results" />
      </div>

      <div class="w-1/3 text-center">
        <div class="my-4">
          <ColorIdentity :colors="colorIdentity" />
        </div>

        <ComboSidebarLinks :combo-link="link" />
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
      // TODO not loaded, what to do here
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
</style>
