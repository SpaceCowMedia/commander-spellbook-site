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
        <ColorIdentity :colors="colorIdentity" />

        <ComboSidebarLinks />
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
  loaded: boolean;
  comboNumber: string;
  cards: CardData[];
  colorIdentity: string[];
  prerequisites: string[];
  steps: string[];
  results: string[];
};

export default Vue.extend({
  data(): ComboData {
    return {
      title: "Looking up Combo",
      loaded: false,
      comboNumber: "0",
      cards: [],
      colorIdentity: [],
      prerequisites: [],
      steps: [],
      results: [],
    };
  },
  async fetch() {
    await this.loadCombo();
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
  methods: {
    async loadCombo() {
      let combo;
      const id = this.$route.params.id;
      this.comboNumber = id;

      try {
        combo = await spellbookApi.findById(id);
      } catch (err) {
        // TODO redirect to 404 page??
        return;
      }

      this.title = `Combo Number ${this.comboNumber}`;
      this.prerequisites.push(...combo.prerequisites);
      this.steps.push(...combo.steps);
      this.results.push(...combo.results);
      this.colorIdentity.push(...combo.colorIdentity.colors);
      const cards = combo.cards.map((card: any) => {
        return {
          name: card.name,
          artUrl: card.getScryfallImageUrl("art_crop"),
          oracleImageUrl: card.getScryfallImageUrl(),
        };
      });
      this.cards.push(...cards);

      this.loaded = true;
    },
  },
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
