import lookupApi from "./spellbook-api";
import normalizeStringInput from "./normalize-string-input";

import type { FormattedApiResponse } from "./types";

type AutoCompleteOption = {
  value: string;
  label: string;
  alias?: RegExp;
};

let isCached = false;
let cachedCards: AutoCompleteOption[];
let cachedResults: AutoCompleteOption[];

const cachedColors: AutoCompleteOption[] = [
  {
    value: "colorless",
    label: "Colorless :manac:",
  },

  // mono colors
  {
    value: "mono white",
    label: "Mono White :manaw:",
  },
  {
    value: "mono blue",
    label: "Mono Blue :manau:",
    alias: /^u$/,
  },
  {
    value: "mono black",
    label: "Mono Black :manab:",
  },
  {
    value: "mono red",
    label: "Mono Red :manar:",
  },
  {
    value: "mono green",
    label: "Mono Green :manag:",
  },

  // guilds
  {
    value: "azorius",
    label: "Azorius :manaw::manau:",
    // catch misspellings of azorius
    alias: /^([wu]{0,2}$|azorio)/,
  },
  {
    value: "dimir",
    label: "Dimir :manau::manab:",
    alias: /^[ub]{0,2}$/,
  },
  {
    value: "rakdos",
    label: "Rakdos :manab::manar:",
    alias: /^[br]{0,2}$/,
  },
  {
    value: "gruul",
    label: "Gruul :manar::manag:",
    alias: /^[rg]{0,2}$/,
  },
  {
    value: "selesnya",
    label: "Selesnya :manag::manaw:",
    alias: /^[gw]{0,2}$/,
  },
  {
    value: "orzhov",
    label: "Orzhov :manaw::manab:",
    alias: /^[wb]{0,2}$/,
  },
  {
    value: "izzet",
    label: "Izzet :manau::manar:",
    alias: /^[ur]{0,2}$/,
  },
  {
    value: "golgari",
    label: "Golgari :manab::manag:",
    alias: /^[bg]{0,2}$/,
  },
  {
    value: "boros",
    label: "Boros :manar::manaw:",
    alias: /^[rw]{0,2}$/,
  },
  {
    value: "simic",
    label: "Simic :manag::manau:",
    alias: /^[gu]{0,2}$/,
  },

  // shards/wedges
  {
    value: "esper",
    label: "Esper :manaw::manau::manab:",
    alias: /^[wub]{0,3}$/,
  },
  {
    value: "grixis",
    label: "Grixis :manau::manab::manar:",
    alias: /^[ubr]{0,3}$/,
  },
  {
    value: "jund",
    label: "Jund :manab::manar::manag:",
    alias: /^[brg]{0,3}$/,
  },
  {
    value: "naya",
    label: "Naya :manar::manag::manaw:",
    alias: /^[rgw]{0,3}$/,
  },
  {
    value: "bant",
    label: "Bant :manag::manaw::manau:",
    alias: /^[gwu]{0,3}$/,
  },
  {
    value: "abzan",
    label: "Abzan :manaw::manab::manag:",
    alias: /^[wbg]{0,3}$/,
  },
  {
    value: "jeskai",
    label: "Jeskai :manau::manar::manaw:",
    alias: /^[urw]{0,3}$/,
  },
  {
    value: "sultai",
    label: "Sultai :manab::manag::manau:",
    alias: /^[bgu]{0,3}$/,
  },
  {
    value: "mardu",
    label: "Mardu :manar::manaw::manab:",
    alias: /^[rwb]{0,3}$/,
  },
  {
    value: "temur",
    label: "Temur :manag::manau::manar:",
    alias: /^[gur]{0,3}$/,
  },

  // 4 color
  {
    value: "yoretiller",
    label: "Yore-Tiller :manaw::manau::manab::manar:",
    alias: /^[wubr]{0,4}$/,
  },
  {
    value: "glinteye",
    label: "Glint-Eye :manau::manab::manar::manag:",
    alias: /^[ubrg]{0,4}$/,
  },
  {
    value: "dunebrood",
    label: "Dune-Brood :manab::manar::manag::manaw:",
    alias: /^[brgw]{0,4}$/,
  },
  {
    value: "inktreader",
    label: "Ink-Treader :manar::manag::manaw::manau:",
    alias: /^[rgwu]{0,4}$/,
  },
  {
    value: "witchmaw",
    label: "Witch-Maw :manag::manaw::manau::manab:",
    alias: /^[gwub]{0,4}$/,
  },

  // 5 color (comment here mostly for symmetry with the other sections :) )
  {
    value: "five color",
    label: "Five Color :manaw::manau::manab::manar::manag:",
    alias: /^(5|[wubrg]{0,5})$/,
  },

  // these are their own entries instaead of
  // aliases for their 4 color name so that
  // the 4 color combos don't show up as options
  // when you type the one color they do not contain
  // or the alternate name for the 4 color combos
  {
    value: "sans white",
    label: "Sans White :manaw::manau::manab::manar:",
  },
  {
    value: "sans blue",
    label: "Sans Blue :manab::manar::manag::manaw:",
  },
  {
    value: "sans black",
    label: "Sans Black :manar::manag::manaw::manau:",
  },
  {
    value: "sans red",
    label: "Sans Red :manag::manaw::manau::manab:",
  },
  {
    value: "sans green",
    label: "Sans Green :manaw::manau::manab::manar:",
  },
  {
    value: "chaos",
    label: "Chaos :manaw::manau::manab::manar:",
  },
  {
    value: "aggression",
    label: "Aggression :manab::manar::manag::manaw:",
  },
  {
    value: "altruism",
    label: "Altruism :manar::manag::manaw::manau:",
  },
  {
    value: "growth",
    label: "Growth :manag::manaw::manau::manab:",
  },
  {
    value: "artifice",
    label: "Artifice :manaw::manau::manab::manar:",
  },
];

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
        collection.push(item);
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
