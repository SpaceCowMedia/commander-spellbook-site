import type CardGrouping from "./models/card-grouping";
import type SpellbookList from "./models/list";
import type ColorIdentity from "./models/color-identity";

export type CommanderSpellbookCombos = Array<string[]>;

export type CommanderSpellbookAPIResponse = {
  spreadsheetId: string;
  valueRanges: [
    {
      range: string;
      majorDimension: "ROWS";
      values: CommanderSpellbookCombos;
    }
  ];
};

export type CompressedApiResponse = {
  d: string; // spellbook iD
  c: string[]; // Card names
  i: string; // color Identity
  p: string; // Prerequisites
  s: string; // Steps
  r: string; // Results
  b?: number; // Banned
  o?: number; // spOiled
  e?: string; // EDHREC link
};

export type FormattedApiResponse = {
  commanderSpellbookId: string;
  permalink: string;
  cards: CardGrouping;
  colorIdentity: ColorIdentity;
  prerequisites: SpellbookList;
  steps: SpellbookList;
  results: SpellbookList;
  hasBannedCard: boolean;
  hasSpoiledCard: boolean;
  edhrecLink?: string;
};

export type ColorIdentityColors = "w" | "u" | "b" | "r" | "g" | "c";

export type SearchError = {
  key: string;
  value: string;
  message: string;
};

export type SearchResults = {
  combos: FormattedApiResponse[];
  errors: SearchError[];
  sort: string;
  order: string;
  message: string;
};

type SizeFilter = {
  method: string;
  value: number;
};

type ValueFilter = {
  method: string;
  value: string;
};

export type Filters = {
  sizeFilters: SizeFilter[];
  includeFilters: ValueFilter[];
  excludeFilters: ValueFilter[];
};

export interface ColorIdentityValueFilter {
  method: string;
  value: ColorIdentityColors[];
}

export type IsNotIncludeExcludeValues = "banned" | "spoiled";
export type IsNotIncludeExcludeParams = {
  banned?: boolean;
  spoiled?: boolean;
};
export type TagValue = "is" | "not" | "include" | "exclude";

export type SearchParameters = {
  cards: Filters;
  prerequisites: Filters;
  steps: Filters;
  results: Filters;
  id: {
    includeFilters: string[];
    excludeFilters: string[];
  };
  colorIdentity: {
    sizeFilters: SizeFilter[];
    includeFilters: ColorIdentityValueFilter[];
    excludeFilters: ColorIdentityValueFilter[];
  };
  tags: {
    banned?: TagValue;
    spoiled?: TagValue;
  };
  sort?: string;
  order?: "ascending" | "descending";
  errors: SearchError[];
};

export type EDHRECData = Record<
  string,
  { cardkingdom: { price: number }; tcgplayer: { price: number } }
>;
