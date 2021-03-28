<template>
  <!-- adapted from https://www.digitalocean.com/community/tutorials/vuejs-vue-autocomplete-component -->
  <div class="autocomplete-container">
    <label class="sr-only" aria-hidden="true" :for="inputId">{{ label }}</label>
    <input
      v-model="localValue"
      :id="inputId"
      type="text"
      :placeholder="placeholder"
      ref="input"
      class="input"
      :class="{
        'border-dark': !error,
        'border-danger': error,
      }"
      @input="onChange"
      @focus="onChange"
      @blur="close"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter"
      autocomplete="off"
      autocapitalize="none"
      autocorrect="off"
      spellcheck="false"
    />
    <ul class="autocomplete-results" v-show="isOpen" ref="autocompleteResults">
      <li v-if="loading" class="autocomplete-result animate-pulse">
        Loading...
      </li>
      <li
        v-for="(item, i) in autocompleteItems"
        v-show="!loading"
        :key="i"
        :class="{ 'is-active': i === arrowCounter }"
        class="autocomplete-result"
        @click="choose(item.value)"
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
      type: Array as PropType<
        { value: string; label: string; alias?: RegExp }[]
      >,
      default() {
        return [];
      },
    },
    active: {
      type: Boolean,
      default: false,
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
      isOpen: false,
      arrowCounter: -1,
      loading: false,
      autocompleteTimeout: (0 as unknown) as ReturnType<typeof setTimeout>,
      autocompleteItems: [] as { value: string; label: string }[],
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
  },
  mounted() {
    // document.addEventListener("click", this.handleClickOutside);
  },
  destroyed() {
    // document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    onChange(): void {
      if (!this.active) {
        return;
      }
      // this.close();

      this.isOpen = true;
      this.lookupAutocomplete(this.value);
    },
    choose(choice: string): void {
      console.log("choice called", choice);
      this.$emit("input", choice);
      this.close();
    },
    close(): void {
      const ref = this.$refs.autocompleteResults as HTMLElement;

      if (ref) {
        ref.scrollTop = 0;
      }

      this.arrowCounter = -1;
      setTimeout(() => {
        this.isOpen = false;
      }, 300);
    },
    handleClickOutside(event: MouseEvent): void {
      if (!this.$el.contains(event.target as HTMLElement)) {
        this.close();
      }
    },
    onArrowDown(e: KeyboardEvent): void {
      e.preventDefault();

      if (this.arrowCounter + 1 < this.autocompleteItems.length) {
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
      e.preventDefault();

      const choice = this.autocompleteItems[this.arrowCounter];

      if (!choice) {
        return;
      }

      this.choose(choice.value);
    },
    lookupAutocomplete(value: string): void {
      if (!this.active) {
        return;
      }

      this.loading = true;

      if (this.autocompleteTimeout) {
        clearTimeout(this.autocompleteTimeout);
      }
      this.autocompleteTimeout = setTimeout(() => {
        const partial = normalizeStringInput(value);
        this.autocompleteItems = this.autocompleteOptions.filter((option) => {
          const mainMatch = option.value.includes(partial);

          if (mainMatch) {
            return mainMatch;
          }

          if (!option.alias) {
            return false;
          }

          return partial.match(option.alias);
        });
        this.loading = false;
      }, 150);
    },
  },
});
</script>

<style>
.autocomplete-container {
  @apply relative flex-grow;
}

.autocomplete-results {
  @apply p-0 m-0 bg-white border border-light overflow-auto h-48 absolute w-full z-10;
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
