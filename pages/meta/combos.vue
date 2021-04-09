<template>
  <div>
    <!--
      this page mostly exists to statically render pages for each combo in the `npm run generate` call
      if this pages is actually exposed on the site via links,
      it should probably get some major design work :)
    -->
    <div id="combo-links">
      <p v-for="link in links" :key="link.id">
        <nuxt-link :to="'/combo/' + link.id + '/'">{{ link.names }}</nuxt-link>
      </p>
    </div>

    <div id="meta-links">
      <p class="py-4">
        <nuxt-link to="/meta/cards/">See all cards</nuxt-link>
      </p>
      <p class="py-4">
        <nuxt-link to="/meta/colors/">See all colors</nuxt-link>
      </p>
      <p class="py-4">
        <nuxt-link to="/meta/results/">See all results</nuxt-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import getAllCombos from "@/lib/api/get-all-combos";

type ComboInfo = {
  id: string;
  names: string;
};
type Data = {
  links: ComboInfo[];
};

export default Vue.extend({
  data(): Data {
    return {
      links: [],
    };
  },
  async fetch() {
    await this.lookupCombos();
  },
  methods: {
    async lookupCombos() {
      const combos = await getAllCombos();

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
