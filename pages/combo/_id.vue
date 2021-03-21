<template>
  <div>
    <CardHeader :cards-art="cardArts" :title="title" :subtitle="subtitle" />

    <CardGroup :cards="cards" />

    <div class="container md:flex flex-row">
      <div class="w-full md:w-2/3">
        <div class="md:hidden pt-4">
          <ColorIdentity :colors="colorIdentity" />
        </div>

        <ComboList
          id="combo-cards"
          class="lg:hidden"
          title="Cards"
          :iterations="cardNames"
          :is-card="true"
          :cards-in-combo="cardNames"
          :include-card-links="true"
        />

        <ComboList
          id="combo-prerequisites"
          title="Prerequisites"
          :iterations="prerequisites"
          :cards-in-combo="cardNames"
        />
        <ComboList
          id="combo-steps"
          title="Steps"
          :show-numbers="true"
          :iterations="steps"
          :cards-in-combo="cardNames"
        />
        <ComboList
          id="combo-results"
          title="Results"
          :iterations="results"
          :cards-in-combo="cardNames"
        />
      </div>

      <aside class="w-full sm:w-1/3 text-center">
        <div id="combo-color-identity" class="my-4 hidden md:block">
          <ColorIdentity :colors="colorIdentity" />
        </div>

        <div v-if="hasBannedCard" class="banned-warning">
          WARNING: Combo contains cards that are banned in Commander
        </div>

        <div v-if="hasPreviewedCard" class="previewed-warning">
          WARNING: Combo contains cards that are from a forthcoming set (and not
          yet legal in Commander)
        </div>

        <ComboSidebarLinks
          :combo-id="comboNumber"
          :combo-link="link"
          :cards="cardNames"
        />
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ColorIdentity from "@/components/ColorIdentity.vue";
import ComboSidebarLinks from "@/components/combo/ComboSidebarLinks.vue";
import CardHeader from "@/components/combo/CardHeader.vue";
import CardGroup from "@/components/combo/CardGroup.vue";
import ComboList from "@/components/combo/ComboList.vue";
import findById from "@/lib/api/find-by-id";

type CardData = {
  name: string;
  oracleImageUrl: string;
  artUrl: string;
};

type ComboData = {
  title: string;
  subtitle: string;
  hasBannedCard: boolean;
  hasPreviewedCard: boolean;
  link: string;
  loaded: boolean;
  comboNumber: string;
  cards: CardData[];
  colorIdentity: string[];
  prerequisites: string[];
  steps: string[];
  results: string[];
};

const NUMBERS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

export default Vue.extend({
  components: {
    CardHeader,
    CardGroup,
    ColorIdentity,
    ComboList,
    ComboSidebarLinks,
  },
  async asyncData({ params }): Promise<ComboData | void> {
    const comboNumber = params.id;
    let combo;

    try {
      combo = await findById(comboNumber);
    } catch (err) {
      // TODO redirect to 404 page??
      return;
    }

    const cards = combo.cards.map((card) => {
      return {
        name: card.name,
        artUrl: card.getScryfallImageUrl("art_crop"),
        oracleImageUrl: card.getScryfallImageUrl("normal"),
      };
    });

    const title = cards
      .map((card, index) => {
        if (index > 2) {
          return "";
        }

        return card.name;
      })
      .filter((cardName) => cardName)
      .join(" | ");

    let subtitle = "";

    if (cards.length === 4) {
      subtitle = `(and ${NUMBERS[1]} other card)`;
    } else if (cards.length > 4) {
      subtitle = `(and ${NUMBERS[cards.length - 3]} other cards)`;
    }

    return {
      comboNumber,
      title,
      subtitle,
      hasBannedCard: combo.hasBannedCard,
      hasPreviewedCard: combo.hasSpoiledCard,
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
      subtitle: "",
      hasBannedCard: false,
      hasPreviewedCard: false,
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
  head() {
    // for some reason, these properties aren't available here???
    // seems like a nuxt typescript issue
    // @ts-ignore
    const title = `${this.title} ${this.subtitle}`;
    // @ts-ignore
    const description = this.results.reduce((str, result) => {
      return str + `\n  * ${result}`;
    }, "Combo Results:");
    // @ts-ignore
    const link = this.link;
    // @ts-ignore
    const logo = this.cardArts[0];

    return {
      title,
      meta: [
        {
          hid: "description",
          name: "description",
          content: description,
        },
        {
          hid: "og-type",
          property: "og:type",
          content: "website",
        },
        {
          hid: "og-url",
          property: "og:url",
          content: link,
        },
        {
          hid: "og-site_name",
          property: "og:site_name",
          content: "Commander Spellbook: Combo Database for Commander (EDH)",
        },
        {
          hid: "og-title",
          property: "og:title",
          content: title,
        },
        {
          hid: "og-description",
          property: "og:description",
          content: description,
        },
        {
          hid: "og-image",
          property: "og:image",
          content: logo,
        },
        {
          hid: "twitter-card",
          property: "twitter:card",
          content: "summary_large_image",
        },
        {
          hid: "twitter-url",
          property: "twitter:url",
          content: link,
        },
        {
          hid: "twitter-title",
          property: "twitter:title",
          content: title,
        },
        {
          hid: "twitter-description",
          property: "twitter:description",
          content: description,
        },
        {
          hid: "twitter-image",
          property: "twitter:image",
          content: logo,
        },
      ],
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
  @apply text-danger font-semibold;
}

.previwed-warning {
  @apply font-semibold;
}
</style>
