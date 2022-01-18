<template>
  <div>
    <CardHeader :cards-art="cardArts" :title="title" :subtitle="subtitle" />

    <CardGroup v-if="loaded" :cards="cards" />

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
        <ComboList
          v-if="metadata.length > 0"
          id="combo-metadata"
          title="Metadata"
          :iterations="metadata"
        />
      </div>

      <aside v-if="loaded" class="w-full md:w-1/3 text-center">
        <div id="combo-color-identity" class="my-4 hidden md:block">
          <ColorIdentity :colors="colorIdentity" />
        </div>

        <div v-if="hasBannedCard" class="banned-warning">
          WARNING: Combo contains cards that are banned in Commander
        </div>

        <div v-if="hasPreviewedCard" class="previewed-warning">
          WARNING: Combo contains cards that have not been released yet (and are
          not yet legal in Commander)
        </div>

        <ComboSidebarLinks
          :combo-id="comboNumber"
          :combo-link="link"
          :cards="cardNames"
          :tcgplayer-price="prices.tcgplayer"
          :cardkingdom-price="prices.cardkingdom"
          :edhrec-link="edhrecLink"
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

type Price = {
  tcgplayer: string;
  cardkingdom: string;
};
type CardData = {
  name: string;
  oracleImageUrl: string;
  artUrl: string;
};

type ComboData = {
  hasBannedCard: boolean;
  hasPreviewedCard: boolean;
  link: string;
  loaded: boolean;
  comboNumber: string;
  cards: CardData[];
  prices: Price;
  colorIdentity: string[];
  prerequisites: string[];
  steps: string[];
  results: string[];
  edhrecLink: string;
  numberOfDecks: number;
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

    const cardGroup = combo.cards;
    const cards = cardGroup.map((card) => {
      return {
        name: card.name,
        artUrl: card.getImageUrl("artCrop"),
        oracleImageUrl: card.getImageUrl("oracle"),
      };
    });

    const prices = {
      tcgplayer: cardGroup.getPriceAsString("tcgplayer"),
      cardkingdom: cardGroup.getPriceAsString("cardkingdom"),
    };

    return {
      comboNumber,
      hasBannedCard: combo.hasBannedCard,
      hasPreviewedCard: combo.hasSpoiledCard,
      link: combo.permalink,
      cards,
      prices,
      loaded: true,
      prerequisites: Array.from(combo.prerequisites),
      steps: Array.from(combo.steps),
      results: Array.from(combo.results),
      colorIdentity: Array.from(combo.colorIdentity.colors),
      edhrecLink: combo.edhrecLink || "",
      numberOfDecks: combo.numberOfEDHRECDecks || 0,
    };
  },
  data(): ComboData {
    return {
      hasBannedCard: false,
      hasPreviewedCard: false,
      link: "",
      loaded: false,
      comboNumber: "0",
      cards: [],
      prices: {
        tcgplayer: "0.00",
        cardkingdom: "0.00",
      },
      colorIdentity: [],
      prerequisites: [],
      steps: [],
      results: [],
      edhrecLink: "",
      numberOfDecks: 0,
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
    const firstCardArt = this.cardArts[0];

    return {
      title,
      meta: [
        {
          hid: "description",
          name: "description",
          content: description,
        },
        {
          hid: "og-url",
          property: "og:url",
          content: link,
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
          content: firstCardArt,
        },
        {
          hid: "twitter-url",
          name: "twitter:url",
          content: link,
        },
        {
          hid: "twitter-title",
          name: "twitter:title",
          content: title,
        },
        {
          hid: "twitter-description",
          name: "twitter:description",
          content: description,
        },
        {
          hid: "twitter-image",
          name: "twitter:image",
          content: firstCardArt,
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
    title(): string {
      if (this.cardNames.length === 0) {
        return "Looking up Combo";
      }

      return this.cardNames.slice(0, 3).join(" | ");
    },
    subtitle(): string {
      if (this.cards.length < 4) {
        return "";
      }
      if (this.cards.length === 4) {
        return `(and ${NUMBERS[1]} other card)`;
      }

      return `(and ${NUMBERS[this.cards.length - 3]} other cards)`;
    },
    metadata(): string[] {
      const data = [];

      if (this.numberOfDecks > 0) {
        data.push(
          `In ${this.numberOfDecks} deck${
            this.numberOfDecks === 1 ? "" : "s"
          } according to EDHREC.`
        );
      }

      return data;
    },
  },
  async mounted() {
    if (this.loaded && !this.$route.query.preview) {
      return;
    }

    this.cards = [];
    this.prerequisites = [];
    this.steps = [];
    this.results = [];
    this.link = "";
    this.loaded = false;

    let combo;

    try {
      combo = await findById(this.$route.params.id, true);
    } catch (err) {
      this.$router.push({
        path: "/combo-not-found/",
      });

      return;
    }

    this.comboNumber = combo.commanderSpellbookId;
    this.hasBannedCard = combo.hasBannedCard;
    this.hasPreviewedCard = combo.hasSpoiledCard;
    this.link = combo.permalink;
    this.cards = combo.cards.map((card) => {
      return {
        name: card.name,
        artUrl: card.getImageUrl("artCrop"),
        oracleImageUrl: card.getImageUrl("oracle"),
      };
    });
    this.prerequisites = Array.from(combo.prerequisites);
    this.steps = Array.from(combo.steps);
    this.results = Array.from(combo.results);
    this.colorIdentity = Array.from(combo.colorIdentity.colors);
    this.prices = {
      tcgplayer: "",
      cardkingdom: "",
    };

    this.loaded = true;
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
