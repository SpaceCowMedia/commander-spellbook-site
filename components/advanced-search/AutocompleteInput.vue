<template>
  <!-- adapted from https://www.digitalocean.com/community/tutorials/vuejs-vue-autocomplete-component -->
  <div class="autocomplete-container">
    <label class="sr-only" aria-hidden="true" :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      ref="input"
      v-model="localValue"
      type="text"
      :placeholder="placeholder"
      class="input"
      :class="{
        'border-dark': !error,
        'border-danger': error,
      }"
      autocomplete="off"
      autocapitalize="none"
      autocorrect="off"
      spellcheck="false"
      @input="onChange"
      @blur="onBlur"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter"
    />
    <ul
      v-show="matchingAutocompleteOptions.length > 0"
      ref="autocompleteResults"
      class="autocomplete-results"
    >
      <li
        v-for="(item, i) in matchingAutocompleteOptions"
        :key="i"
        :class="{ 'is-active': i === arrowCounter }"
        class="autocomplete-result"
        @click="choose(item)"
      >
        <TextWithMagicSymbol :text="item.label" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import TextWithMagicSymbol from "@/components/TextWithMagicSymbol.vue";

import normalizeStringInput from "@/lib/api/normalize-string-input";

type AutoCompleteOption = { value: string; label: string; alias?: RegExp };

const MAX_NUMBER_OF_MATCHING_RESULTS = 20;
const AUTOCOMPLETE_DELAY = 150;
const BLUR_CLOSE_DELAY = 1000;

export default Vue.extend({
  components: {
    TextWithMagicSymbol,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
    autocompleteOptions: {
      type: Array as PropType<AutoCompleteOption[]>,
      default() {
        return [];
      },
    },
    inputId: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      arrowCounter: -1,
      autocompleteTimeout: (0 as unknown) as ReturnType<typeof setTimeout>,
      matchingAutocompleteOptions: [] as { value: string; label: string }[],
    };
  },
  computed: {
    localValue: {
      get(): string {
        return this.value;
      },
      set(value: string): void {
        this.$emit("input", value);
      },
    },
    active(): boolean {
      return this.autocompleteOptions.length > 0;
    },
  },
  methods: {
    onChange(): void {
      if (!this.active) {
        return;
      }
      this.lookupAutocomplete();
    },
    onBlur(): void {
      if (!this.active) {
        return;
      }

      // this needs to be in a set timeout
      // so the action to choose can still reference
      // the autocomplete options, if it's not in a
      // set timeout, clicking the option causes the
      // blur event to fire first, and prevents the
      // click event from even happening because the
      // menu closes before the click occurs
      setTimeout(() => {
        this.close();
      }, BLUR_CLOSE_DELAY);
    },
    choose(choice: AutoCompleteOption): void {
      this.$emit("input", choice.value);
      this.close();
    },
    close(): void {
      const ref = this.$refs.autocompleteResults as HTMLElement;

      if (ref) {
        ref.scrollTop = 0;
      }

      this.arrowCounter = -1;
      this.matchingAutocompleteOptions = [];
    },
    onArrowDown(e: KeyboardEvent): void {
      e.preventDefault();

      if (this.arrowCounter + 1 < this.matchingAutocompleteOptions.length) {
        this.arrowCounter = this.arrowCounter + 1;
      }

      this.scrollToSelection();
    },
    onArrowUp(e: KeyboardEvent): void {
      e.preventDefault();

      if (this.arrowCounter > 0) {
        this.arrowCounter = this.arrowCounter - 1;
      }

      this.scrollToSelection();
    },
    scrollToSelection(): void {
      const ref = this.$refs.autocompleteResults as HTMLElement;
      const nodes = ref.querySelectorAll("li");
      const li = nodes[this.arrowCounter];

      if (!li || !ref) {
        return;
      }
      ref.scrollTop = li.offsetTop - 50;
    },
    onEnter(e: KeyboardEvent): void {
      const choice = this.matchingAutocompleteOptions[this.arrowCounter];

      if (!choice) {
        // allow the form to be submitted if enter was used without a selection
        return;
      }

      e.preventDefault();

      this.choose(choice);
    },
    lookupAutocomplete(): void {
      if (!this.active) {
        return;
      }

      if (!this.value) {
        this.close();
        return;
      }

      if (this.autocompleteTimeout) {
        clearTimeout(this.autocompleteTimeout);
      }
      this.autocompleteTimeout = setTimeout(() => {
        if (!this.value) {
          this.close();
          return;
        }

        const normalizedValue = normalizeStringInput(this.value);
        this.matchingAutocompleteOptions = [];

        const totalOptions = this.autocompleteOptions
          .filter((option) => {
            const mainMatch = option.value.includes(normalizedValue);

            return (
              mainMatch || (option.alias && normalizedValue.match(option.alias))
            );
          })
          .sort((a, b) => {
            const indexA = a.value.indexOf(normalizedValue);
            const indexB = b.value.indexOf(normalizedValue);

            if (indexA === indexB) {
              return 0;
            }

            if (indexA === -1) {
              return 1;
            }
            if (indexB === -1) {
              return -1;
            }

            if (indexA < indexB) {
              return -1;
            } else if (indexB < indexA) {
              return 1;
            }

            return 0;
          });

        this.matchingAutocompleteOptions = totalOptions.slice(
          0,
          MAX_NUMBER_OF_MATCHING_RESULTS
        );
      }, AUTOCOMPLETE_DELAY);
    },
  },
});
</script>

<style>
.autocomplete-container {
  @apply relative flex-grow;
}

.autocomplete-results {
  @apply p-0 m-0 bg-white border border-light overflow-auto max-h-48 absolute w-full z-10;
}

.autocomplete-result {
  @apply text-left p-2 cursor-pointer;
}

.autocomplete-result.is-active,
.autocomplete-result:hover {
  @apply bg-link text-white;
}

.input {
  @apply border px-3 py-2 w-full appearance-none rounded-none;
}
</style>
