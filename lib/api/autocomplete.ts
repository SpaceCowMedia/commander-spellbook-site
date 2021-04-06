import lookupApi from "./spellbook-api";
import normalizeStringInput from "./normalize-string-input";
import cachedColors from "./color-autocompletes";

import type { FormattedApiResponse } from "./types";

type AutoCompleteOption = {
  value: string;
  label: string;
  alias?: RegExp;
};

let isCached = false;
let cachedCards: AutoCompleteOption[];
let cachedResults: AutoCompleteOption[];

function collectCardNames(
  combos: FormattedApiResponse[]
): AutoCompleteOption[] {
  return collect(combos.map((c) => c.cards.map((card) => card.name)).flat());
}

function collectResults(combos: FormattedApiResponse[]): AutoCompleteOption[] {
  return collect(combos.map((c) => Array.from(c.results)).flat());
}

function collect(items: string[]): AutoCompleteOption[] {
  return items
    .reduce((collection, item) => {
      if (
        !collection.find(
          (piece) => normalizeStringInput(item) === normalizeStringInput(piece)
        )
      ) {
        if (!item.trim().match(/^[(*]/)) {
          collection.push(item.trim());
        }
      }
      return collection;
    }, [] as string[])
    .sort()
    .map((option) => {
      return {
        value: normalizeStringInput(option),
        label: option,
      };
    });
}

export default async function autocomplete(
  paramType: "cards" | "colors" | "results",
  partial: string
): Promise<AutoCompleteOption[]> {
  let options: AutoCompleteOption[];

  if (!isCached && paramType !== "colors") {
    const combos = await lookupApi();

    cachedCards = collectCardNames(combos);
    cachedResults = collectResults(combos);
    isCached = true;
  }

  switch (paramType) {
    case "cards":
      options = cachedCards;
      break;
    case "colors":
      options = cachedColors;
      break;
    case "results":
      options = cachedResults;
      break;
  }

  if (!options) {
    return [];
  }

  partial = normalizeStringInput(partial);

  if (!partial) {
    return options;
  }

  return options.filter((option) => {
    const mainMatch = option.value.includes(partial);

    if (mainMatch) {
      return mainMatch;
    }

    if (!option.alias) {
      return false;
    }

    return partial.match(option.alias);
  });
}

export function clearCache(): void {
  isCached = false;
}
