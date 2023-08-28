export type SubmissionCardType = {
  card: string,
  zoneLocations: string[],
  battlefieldCardState: string,
  exileCardState: string,
  libraryCardState: string,
  graveyardCardState: string,
  mustBeCommander: boolean,
}

export const defaultSubmissionCard: SubmissionCardType = {
  card: "",
  zoneLocations: [],
  battlefieldCardState: "",
  exileCardState: "",
  libraryCardState: "",
  graveyardCardState: "",
  mustBeCommander: false,
}
