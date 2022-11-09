<template>
  <div>
    <h1 class="heading-title">Site Settings</h1>
    <DashboardSection title="Featured Combos">
      <form @submit.prevent="updateFeaturedCombos">
        <div
          v-if="featuredError"
          id="featured-error"
          class="p-4 rounded-sm bg-red-200"
        >
          {{ featuredError }}
        </div>

        <div class="my-2">
          <label for="featured-button-text">Home Page Button Text</label>
          <input
            id="featured-button-text"
            v-model="buttonText"
            class="input"
            type="text"
          />
        </div>

        <div class="my-2">
          <label for="featured-set-codes">Set Codes to Feature</label>
          <div
            v-for="(setCode, index) in setCodes"
            :key="index"
            class="flex mb-2"
          >
            <AutocompleteInput
              v-model="setCode.value"
              label="foo"
              :input-id="'featured-set-code-' + index"
              :autocomplete-options="setCodeAutocompleteOptions"
              :use-value-for-input="true"
              :match-against-option-label="true"
            />
            <button
              v-if="index !== setCodes.length - 1"
              :id="'remove-set-code-rule-button-' + index"
              type="button"
              class="button dark w-10 tight"
              @click="removeSetCodeRule(index)"
            >
              -
            </button>
            <button
              v-if="index === setCodes.length - 1"
              :id="'add-set-code-rule-button-' + index"
              type="button"
              class="button dark tight w-10"
              @click="addSetCodeRule(index)"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <button
            id="submit-featured-updates"
            type="submit"
            class="button tight"
          >
            Update Featured Combos Page
          </button>
        </div>

        <div
          v-if="featuredInfo"
          id="featured-info"
          class="my-2 p-4 rounded-sm bg-yellow-200"
        >
          {{ featuredInfo }}
        </div>
      </form>
    </DashboardSection>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import scryfall from "scryfall-client";
import DashboardSection from "@/components/dashboard/DashboardSection.vue";
import AutocompleteInput from "@/components/AutocompleteInput.vue";

type SiteSettingsData = {
  buttonText: string;
  setCodes: Array<{ value: string }>;
  setCodeAutocompleteOptions: Array<{ value: string; label: string }>;
  setData: Array<Record<string, string>>;
  featuredError: string;
  featuredInfo: string;
};

// TODO this should be pulled out of the firebase module
type FeaturedRule = { kind: "card"; cardName?: string; setCode?: string };

export default Vue.extend({
  components: {
    AutocompleteInput,
    DashboardSection,
  },
  layout: "EditorDashboard",
  data(): SiteSettingsData {
    return {
      buttonText: "",
      setCodes: [{ value: "" }],
      setCodeAutocompleteOptions: [],
      setData: [],
      featuredError: "",
      featuredInfo: "",
    };
  },
  computed: {
    rules(): Array<FeaturedRule> {
      return this.setCodes
        .filter((input) => {
          return input.value.trim();
        })
        .map((input) => {
          return { kind: "card", setCode: input.value };
        });
    },
  },
  async mounted() {
    const fetchMagicSetsPromise = this.fetchMagicSets();

    await this.fetchCurrentFeaturedRules();

    // TODO turn on form

    await fetchMagicSetsPromise;

    this.populateSetCodeAutocompleteOptions();
  },
  methods: {
    async fetchCurrentFeaturedRules() {
      // TODO getDoc should take a type so we can return the data structure
      const featuredRules = await this.$fire.firestore.getDoc(
        "site-settings",
        "featured-combos"
      );

      this.buttonText = featuredRules.buttonText;
      this.setCodes = featuredRules.rules
        .filter((rule: FeaturedRule) => {
          return rule.kind === "card" && rule.setCode;
        })
        .map((rule: FeaturedRule) => {
          return { value: rule.setCode };
        });
    },
    async fetchMagicSets(): Promise<void> {
      const sets = await scryfall.getSets();

      this.setData = sets.filter((setData) => {
        return (
          !setData.digital &&
          setData.set_type !== "token" &&
          setData.set_type !== "promo" &&
          setData.set_type !== "memorabilia"
        );
      });
    },
    populateSetCodeAutocompleteOptions() {
      const options = this.setData.map((setData) => {
        return {
          value: setData.code,
          label: `${setData.name} (${setData.code})`,
        };
      });
      this.setCodeAutocompleteOptions.push(...options);
    },
    updateFeaturedCombos(): Promise<void> {
      this.featuredError = "";
      this.featuredInfo = "";

      return this.$api("/site-settings/update-featured", {
        buttonText: this.buttonText,
        rules: this.rules,
      })
        .then(() => {
          this.featuredInfo =
            "Rules for what combos to feature have been updated. They will go into effect the next time the site deploys (roughly every 2 hours).";
        })
        .catch((err) => {
          this.featuredError = err.message;
        });
    },
    addSetCodeRule(index: number) {
      this.setCodes.splice(index + 1, 0, { value: "" });
    },
    removeSetCodeRule(index: number) {
      this.setCodes.splice(index, 1);
    },
  },
});
</script>
