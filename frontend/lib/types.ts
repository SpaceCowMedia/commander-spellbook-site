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

export type NewPrerequisiteType = {
  z: string; // zone either H, B, C, G, L, E or multi
  s: string; // prerequisite string
}
export type CompressedApiResponse = {
  d: string; // spellbook iD
  c: string[]; // Card names
  i: string; // color Identity
  p?: string; // Legacy Prerequisites
  s: string; // Steps
  r: string; // Results
  b?: number; // Banned
  o?: number; // spoiled
  e?: string; // EDHREC link
  t?: NewPrerequisiteType[]; // New Prerequisites
  l?: string // legacy id
};

export type FormattedApiResponse = {
  commanderSpellbookId: string;
  legacyId: string;
  permalink: string;
  cards: CardGrouping;
  colorIdentity: ColorIdentity;
  prerequisites: SpellbookList;
  prerequisiteList: NewPrerequisiteType[];
  steps: SpellbookList;
  results: SpellbookList;
  hasBannedCard: boolean;
  hasSpoiledCard: boolean;
  edhrecLink: string;
  numberOfEDHRECDecks: number;
};

export type ColorIdentityColors = "w" | "u" | "b" | "r" | "g" | "c";
export type SortValue =
  | "prerequisites"
  | "steps"
  | "results"
  | "cards"
  | "colors"
  | "created"
  | "price"
  | "popularity";
export type OrderValue = "auto" | "ascending" | "descending";
export type VendorValue = "tcgplayer" | "cardkingdom";

export type SearchError = {
  key: string;
  value: string;
  message: string;
};

export type SearchResults = {
  combos: FormattedApiResponse[];
  errors: SearchError[];
  sort: SortValue;
  vendor: VendorValue;
  order: OrderValue;
  message: string;
};

export type SizeFilter = {
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
  edhrecDecks: {
    sizeFilters: SizeFilter[];
  };
  price: {
    vendor?: VendorValue;
    filters: SizeFilter[];
  };
  tags: {
    banned?: TagValue;
    spoiled?: TagValue;
  };
  sort?: SortValue;
  order?: OrderValue;
  errors: SearchError[];
};

export type EDHRECData = Record<string, Record<VendorValue, { price: number }>>;


/**
 * The following types are for the new backend
 */
export type BackendCard = {
  id: number,
  name: string,
  oracleId: string,
  identity: string,
  spoiler: boolean,
}

export type CardComponent = {
  card: BackendCard,
  zoneLocations: string[],
  cardState: string,
  battlefieldCardState: string,
  exileCardState: string,
  libraryCardState: string,
  graveyardCardState: string,
  mustBeCommander: boolean,
}

export type Template = {
  name: string,
  scryfallQuery: string,
}

export type Feature = {
  id: number,
  name: string,
  description: string,
  utility: boolean
}

export type BackendCombo = {
  id: number,
}

export type Variant = {
  id: string,
  uses: CardComponent[],
  requires: Template[],
  produces: Feature[],
  of : BackendCombo[],
  includes: BackendCombo[],
  identity: string,
  manaNeeded: string,
  otherPrerequisites: string,
  description: string,
  legal: boolean,
  legalities?: {
    commander: boolean,
    pauperCommanderMain: boolean,
    pauperCommanderCommander: boolean,
    oathbreaker: boolean,
    predh: boolean,
    brawl: boolean,
    vintage: boolean,
    legacy: boolean,
    modern: boolean,
    pioneer: boolean,
    standard: boolean,
    pauper: boolean,
  }
  prices?: {
    tcgplayer: number,
    cardkingdom: number,
    cardmarket: number,
  }
  spoiler: boolean,
}

export type VariantBulkData = {
  timestamp: string,
  variants: Variant[]
}


export type ComboSubmissionErrorType = {
  [key: string]: (ComboSubmissionErrorType | string)[],
} & {statusCode: number}
