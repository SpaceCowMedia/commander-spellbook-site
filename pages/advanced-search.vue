<template>
  <div>
    <div class="container">
      <ArtCircle
        card-name="Tribute Mage"
        artist="Scott Murphy"
        class="m-auto md:block hidden"
      />
      <h1 class="heading-title">Advanced Search</h1>

      <p class="text-center">
        For more information on the syntax for searches,
        <nuxt-link to="/syntax-guide">check out the Syntax Guide.</nuxt-link>
      </p>
    </div>

    <form @submit.prevent="submit">
      <div id="card-name-inputs" class="container">
        <MultiSearchInput
          :inputs="cards"
          label="Card Name"
          :operator-options="cardOperatorOptions"
          @add-input="addInput('cards', $event)"
          @remove-input="removeInput('cards', $event)"
        />
      </div>

      <div id="card-amount-inputs" class="container">
        <MultiSearchInput
          :inputs="cardAmounts"
          label="Number of Cards"
          plural-label="Number of Cards"
          :operator-options="cardAmountOperatorOptions"
          @add-input="addInput('cardAmounts', $event)"
          @remove-input="removeInput('cardAmounts', $event)"
        />
      </div>

      <div id="color-identity-inputs" class="container">
        <MultiSearchInput
          :inputs="colorIdentity"
          default-placeholder="ex: wug, temur, colorless, black"
          label="Color Identity"
          :operator-options="colorIdentityOperatorOptions"
          @add-input="addInput('colorIdentity', $event)"
          @remove-input="removeInput('colorIdentity', $event)"
        />
      </div>

      <div id="prerequisite-inputs" class="container">
        <MultiSearchInput
          :inputs="prerequisites"
          default-placeholder="all permanents on the battlefield"
          label="Prerequisite"
          :operator-options="comboDataOperatorOptions"
          @add-input="addInput('prerequisites', $event)"
          @remove-input="removeInput('prerequisites', $event)"
        />
      </div>

      <div id="step-inputs" class="container">
        <MultiSearchInput
          :inputs="steps"
          default-placeholder="ex: intruder alarm triggers as well"
          label="Step"
          :operator-options="comboDataOperatorOptions"
          @add-input="addInput('steps', $event)"
          @remove-input="removeInput('steps', $event)"
        />
      </div>

      <div id="result-inputs" class="container">
        <MultiSearchInput
          :inputs="results"
          default-placeholder="ex: win the game"
          label="Result"
          :operator-options="comboDataOperatorOptions"
          @add-input="addInput('results', $event)"
          @remove-input="removeInput('results', $event)"
        />
      </div>

      <div id="previewed-combos" class="container">
        <RadioSearchInput
          label="Previewed / Spoiled Combos"
          :checked-value="previewed"
          :options="previewedOptions"
          form-name="previewed"
          @update-radio="updateRadio('previewed', $event)"
        />
      </div>

      <div id="banned-combos" class="container">
        <RadioSearchInput
          label="Banned Combos"
          :checked-value="banned"
          :options="bannedOptions"
          form-name="banned"
          @update-radio="updateRadio('banned', $event)"
        />
      </div>

      <div class="container text-center pb-8">
        <div class="flex flex-row items-center">
          <button
            id="advanced-search-submit-button"
            type="submit"
            class="border border-primary text-link p-4 rounded-l-sm hover:bg-primary hover:text-white"
          >
            Search&nbsp;With&nbsp;Query
          </button>
          <div
            id="search-query"
            class="w-full font-mono border border-gray-200 bg-gray-200 rounded-r-sm text-left p-4 truncate"
            aria-hidden="true"
          >
            <span v-if="query">{{ query }}</span>
            <span v-else class="text-dark"
              >(your query will populate here when you've entered any search
              terms)</span
            >
          </div>
        </div>

        <div id="advanced-search-validation-error" class="text-danger p-4">
          {{ validationError }}
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ArtCircle from "@/components/ArtCircle.vue";
import MultiSearchInput from "@/components/advanced-search/MultiSearchInput.vue";
import RadioSearchInput from "@/components/advanced-search/RadioSearchInput.vue";

type InputData = {
  value: string;
  operator: string;
  error?: string;
};
type OperatorOption = {
  value: string;
  label: string;
  placeholder?: string;
};
type TextInputModelTypes =
  | "cards"
  | "cardAmounts"
  | "colorIdentity"
  | "prerequisites"
  | "steps"
  | "results";

type Data = {
  cards: InputData[];
  cardOperatorOptions: OperatorOption[];

  cardAmounts: InputData[];
  cardAmountOperatorOptions: OperatorOption[];

  colorIdentity: InputData[];
  colorIdentityOperatorOptions: OperatorOption[];

  prerequisites: InputData[];
  steps: InputData[];
  results: InputData[];
  comboDataOperatorOptions: OperatorOption[];

  validationError: string;

  previewed: string;
  previewedOptions: OperatorOption[];
  banned: string;
  bannedOptions: OperatorOption[];
};

const DEFAULT_PREVIEWED_VALUE = "include";
const DEFAULT_BANNED_VALUE = "exclude";

export default Vue.extend({
  components: {
    ArtCircle,
    MultiSearchInput,
    RadioSearchInput,
  },
  data(): Data {
    return {
      cards: [{ value: "", operator: ":" }],
      cardOperatorOptions: [
        {
          value: ":",
          label: "Contains card with name",
          placeholder: "ex: isochron",
        },
        {
          value: "=",
          label: "Contains card with exact name",
          placeholder: "ex: basalt monolith",
        },
        {
          value: ":-exclude",
          label: "Does not contain card with name",
          placeholder: "ex: isochron",
        },
        {
          value: "=-exclude",
          label: "Does not contain card with exact name",
          placeholder: "ex: basalt monolith",
        },
      ],

      cardAmounts: [{ value: "", operator: "=-number" }],
      cardAmountOperatorOptions: [
        { value: "=-number", label: "Contains exactly x cards (number)" },
        { value: ">-number", label: "Contains more than x cards (number)" },
        { value: "<-number", label: "Contains less than x cards (number)" },
      ],

      colorIdentity: [{ value: "", operator: ":" }],
      colorIdentityOperatorOptions: [
        {
          value: ":",
          label: "Is within the color identity",
        },
        {
          value: "=",
          label: "Is exactly the color identity",
        },
        {
          value: ":-exclude",
          label: "Is not within the color identity",
        },
        {
          value: "=-exclude",
          label: "Is not exactly the color identity",
        },
        { value: ">-number", label: "Contains more than x colors (number)" },
        { value: "<-number", label: "Contains less than x colors (number)" },
        { value: "=-number", label: "Contains exactly x colors (number)" },
      ],

      prerequisites: [{ value: "", operator: ":" }],
      steps: [{ value: "", operator: ":" }],
      results: [{ value: "", operator: ":" }],
      comboDataOperatorOptions: [
        {
          value: ":",
          label: "Contains the phrase",
          placeholder: "ex: mana, untap, additional",
        },
        { value: "=", label: "Is exactly" },
        {
          value: ":-exclude",
          label: "Does not contain the phrase",
          placeholder: "ex: mana, untap, additional",
        },
        { value: "=-exclude", label: "Is not exactly" },
        { value: ">-number", label: "Contains more than x (number)" },
        { value: "<-number", label: "Contains less than x (number)" },
        { value: "=-number", label: "Contains exactly x (number)" },
      ],

      previewed: DEFAULT_PREVIEWED_VALUE,
      previewedOptions: [
        {
          value: "include",
          label:
            "Include combos with newly previewed cards in search results (default search behavior)",
        },
        {
          value: "exclude",
          label: "Exclude combos with newly previewed cards in search results",
        },
        {
          value: "is",
          label: "Only show combos with newly previewed cards",
        },
      ],

      banned: DEFAULT_BANNED_VALUE,
      bannedOptions: [
        {
          value: "exclude",
          label:
            "Exclude combos with banned cards in search results (default search behavior)",
        },
        {
          value: "include",
          label: "Include combos with banned cards in search results",
        },
        {
          value: "is",
          label: "Only show combos with banned cards",
        },
      ],

      validationError: "",
    };
  },
  computed: {
    query(): string {
      let query = "";

      this.validate();

      function makeQueryFunction(
        key: string
      ): Parameters<typeof Array.prototype.forEach>[0] {
        return (input: InputData) => {
          const value = input.value.trim();
          const isSimpleValue = value.match(/^[\w\d]*$/);
          const modifier = input.operator.split("-")[1];
          const isNumericOperator = modifier === "number";
          const isExclusionOperator = modifier === "exclude";
          let operator = input.operator.split("-")[0];
          let keyInQuery = key;
          const isSimpleCardValue =
            isSimpleValue &&
            keyInQuery === "card" &&
            operator === ":" &&
            !isExclusionOperator;

          if (!value) {
            return;
          }

          let quotes = "";

          if (!isSimpleValue) {
            quotes = '"';

            if (value.includes(quotes)) {
              quotes = "'";
            }
          }

          if (isSimpleCardValue) {
            keyInQuery = "";
            operator = "";
          } else if (isNumericOperator) {
            if (keyInQuery === "ci") {
              keyInQuery = "colors";
            } else if (keyInQuery === "pre") {
              keyInQuery = "prerequisites";
            } else {
              keyInQuery += "s";
            }
          } else if (isExclusionOperator) {
            keyInQuery = `-${keyInQuery}`;
          }

          query += ` ${keyInQuery}${operator}${quotes}${value}${quotes}`;
        };
      }

      this.cards.forEach(makeQueryFunction("card"));
      this.cardAmounts.forEach(makeQueryFunction("card"));
      this.colorIdentity.forEach(makeQueryFunction("ci"));
      this.prerequisites.forEach(makeQueryFunction("pre"));
      this.steps.forEach(makeQueryFunction("step"));
      this.results.forEach(makeQueryFunction("result"));

      if (this.previewed !== DEFAULT_PREVIEWED_VALUE) {
        query += ` ${this.previewed}:previewed`;
      }
      if (this.banned !== DEFAULT_BANNED_VALUE) {
        query += ` ${this.banned}:banned`;
      }

      query = query.trim();

      return query;
    },
  },
  methods: {
    submit(): void {
      this.validationError = "";

      if (!this.query) {
        this.validationError = "No search queries entered.";
        return;
      }

      if (this.validate()) {
        this.validationError =
          "Check for errors in your search terms before submitting.";
        return;
      }

      this.$router.push({
        path: "/search",
        query: {
          q: `${this.query}`,
        },
      });
    },
    validate(): boolean {
      let hasValidationError = false;

      this.validationError = "";

      function val(input: InputData) {
        input.error = "";

        if (input.value.includes("'") && input.value.includes('"')) {
          input.error =
            "Contains both single and double quotes. A card name may only use one kind.";
        }

        if (
          input.operator.split("-")[1] === "number" &&
          !Number.isInteger(Number(input.value))
        ) {
          input.error = "Contains a non-integer. Use a full number instead.";
        }

        if (input.error) {
          hasValidationError = true;
        }
      }

      this.cards.forEach(val);
      this.cardAmounts.forEach(val);
      this.colorIdentity.forEach(val);
      this.prerequisites.forEach(val);
      this.steps.forEach(val);
      this.results.forEach(val);

      return hasValidationError;
    },
    addInput(model: TextInputModelTypes, index: number): void {
      let operator = ":";

      if (model === "cardAmounts") {
        // the cardAmounts model has a different default operator than
        // the rest of them
        operator = "=-number";
      }
      this[model].splice(index + 1, 0, { operator, value: "" });
    },
    removeInput(model: TextInputModelTypes, index: number): void {
      this[model].splice(index, 1);
    },
    updateRadio(model: "banned" | "previewed", value: string): void {
      this[model] = value;
    },
  },
});
</script>

<style scoped>
.container {
  @apply pt-6 mb-6;
}

.subtitle {
  @apply font-light text-3xl;
}
</style>
