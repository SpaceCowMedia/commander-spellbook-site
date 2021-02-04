<template>
  <div>
    <div class="container">
      <h2 class="heading-title">Advanced Search</h2>
      <p>TODO: Intro text about how this works</p>
    </div>

    <form @submit.prevent="submit">
      <div class="divider"></div>

      <div id="card-name-inputs" class="container">
        <MultiSearchInput
          label="Card Name"
          placeholder="Card Name"
          @update="updateCards"
        />
      </div>

      <div class="divider"></div>

      <div id="color-identity-chooser" class="container">
        <div class="my-2 flex">
          <div class="w-1/3 flex-grow">
            <span>Color Identity</span>
          </div>
          <div class="w-2/3 flex flex-row">
            <button
              v-for="(color, index) in colorIdentity"
              :key="`ci-input-${index}`"
              type="button"
              class="color-identity-wrapper cursor-pointer"
              :class="{
                'opacity-25': !color.checked,
                ['ci-button-' + index]: true,
              }"
              @click="toggleColorIdentity(index)"
            >
              <ColorIdentity :colors="[color.symbol]" />
            </button>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div id="prerequisite-inputs" class="container">
        <MultiSearchInput
          label="Prerequisite"
          placeholder="Text"
          @update="updatePrerequisites"
        />
      </div>

      <div class="divider"></div>

      <div id="step-inputs" class="container">
        <MultiSearchInput
          label="Step"
          placeholder="Text"
          @update="updateSteps"
        />
      </div>

      <div class="divider"></div>

      <div id="result-inputs" class="container">
        <MultiSearchInput
          label="Result"
          placeholder="Text"
          @update="updateResults"
        />
      </div>

      <div class="divider"></div>

      <div class="container">
        <button
          id="advanced-search-submit-button"
          type="submit"
          class="button--red"
        >
          Search
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

type ColorIdentityInput = {
  symbol: string;
  checked: boolean;
};

type Data = {
  cards: string[];
  prerequisites: string[];
  steps: string[];
  results: string[];
  colorIdentity: ColorIdentityInput[];
};

export default Vue.extend({
  data(): Data {
    return {
      cards: [],
      prerequisites: [],
      steps: [],
      results: [],
      colorIdentity: [
        {
          symbol: "w",
          checked: true,
        },
        {
          symbol: "u",
          checked: true,
        },
        {
          symbol: "b",
          checked: true,
        },
        {
          symbol: "r",
          checked: true,
        },
        {
          symbol: "g",
          checked: true,
        },
      ],
    };
  },
  methods: {
    submit(): void {
      let query = "";

      function makeQueryFunction(
        key: string
      ): Parameters<typeof Array.prototype.forEach>[0] {
        return (value: string) => {
          if (!value.trim()) {
            return;
          }

          let quotes = '"';

          if (value.includes(quotes)) {
            if (value.includes("'")) {
              // malformed if it includes both double quotes and single quotes
              return;
            }
            quotes = "'";
          }

          query += ` ${key}:${quotes}${value}${quotes}`;
        };
      }

      this.cards.forEach(makeQueryFunction("card"));

      const colors = this.colorIdentity.reduce((accum, color) => {
        if (color.checked) {
          accum += color.symbol;
        }

        return accum;
      }, "");

      if (!colors) {
        query += " ci:colorless";
      } else if (colors.length < 5) {
        query += ` ci:${colors}`;
      }

      this.prerequisites.forEach(makeQueryFunction("pre"));
      this.steps.forEach(makeQueryFunction("step"));
      this.results.forEach(makeQueryFunction("result"));

      query = query.trim();

      if (!query) {
        // TODO erorr
        return;
      }

      this.$router.push({
        path: "/search",
        query: {
          q: `${query}`,
        },
      });
    },
    toggleColorIdentity(index: number): void {
      this.colorIdentity[index].checked = !this.colorIdentity[index].checked;
    },
    updateCards(payload: { index: number; value: string }): void {
      this.cards[payload.index] = payload.value;
    },
    updatePrerequisites(payload: { index: number; value: string }): void {
      this.prerequisites[payload.index] = payload.value;
    },
    updateSteps(payload: { index: number; value: string }): void {
      this.steps[payload.index] = payload.value;
    },
    updateResults(payload: { index: number; value: string }): void {
      this.results[payload.index] = payload.value;
    },
  },
});
</script>

<style scoped>
.divider {
  @apply border-t w-full bg-gray-400;
}

.container {
  @apply pt-6 mb-6;
}

.subtitle {
  @apply font-light text-3xl;
}
</style>
