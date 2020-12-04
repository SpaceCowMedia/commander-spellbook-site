<template>
  <div>
    <!--
      this page mostly exists to statically render pages for each combo in the `npm run generate` call
      if this pages is actually exposed on the site via links,
      it should probably get some major design work :)
    -->
    <p v-for="link in links" :key="link.id">
      <nuxt-link :to="'/combo/' + link.id">{{ link.names }}</nuxt-link>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import spellbookApi from "commander-spellbook";

type ComboInfo = {
  id: string;
  names: string;
};
type Data = {
  links: ComboInfo[];
};

export default Vue.extend({
  async fetch() {
    await this.lookupCombos();
  },
  data(): Data {
    return {
      links: [],
    };
  },
  methods: {
    async lookupCombos() {
      const combos = await spellbookApi.search();
      this.links.push(
        ...combos.map((c) => {
          return {
            names: c.cards.join(", "),
            id: String(c.commanderSpellbookId),
          };
        })
      );
    },
  },
});
</script>

<style>
/* styles here */
</style>
