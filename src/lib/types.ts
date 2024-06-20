
export type NewPrerequisiteType = {
  z: string; // zone either H, B, C, G, L, E or multi
  s: string; // prerequisite string
}


export type ColorIdentityColors = "w" | "u" | "b" | "r" | "g" | "c";
export type VendorValue = "tcgplayer" | "cardkingdom";


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
  template: {
    id: number,
    name: string,
    scryfallQuery: string,
    scryfallApi: string,
  },
  zoneLocations: string[],
  exileCardState: string,
  libraryCardState: string,
  graveyardCardState: string,
  battlefieldCardState: string,
  mustBeCommander: boolean,
  quantity: number,
}

export type Feature = {
  id: number,
  name: string,
  uncountable: boolean,
}

export type FeatureComponent = {
  feature: Feature,
  name?: string,
  quantity: number,
}

export type BackendCombo = {
  id: number,
}

export type Variant = {
  id: string,
  uses: CardComponent[],
  requires: Template[],
  produces: FeatureComponent[],
  of : BackendCombo[],
  includes: BackendCombo[],
  identity: string,
  manaNeeded: string,
  otherPrerequisites: string,
  description: string,
  notes?: string,
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
  prices: {
    tcgplayer: string,
    cardkingdom: string,
    cardmarket: string,
  }
  spoiler: boolean,
  popularity?: number,
  status: string,
}

export type VariantBulkData = {
  timestamp: string,
  variants: Variant[]
}

export type VariantAlias = {
  id: string,
  variant: Variant,
}

export type ComboSubmissionErrorType = {
  [key: string]: (ComboSubmissionErrorType | string)[],
} & {statusCode: number}
