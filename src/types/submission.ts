export type SubmissionCardType = {
  card: string,
  zoneLocations: string[],
  battlefieldCardState: string,
  exileCardState: string,
  libraryCardState: string,
  graveyardCardState: string,
  mustBeCommander: boolean,
  template: undefined,
}

export type TemplateSubmissionType = {
  template: string,
  zoneLocations: string[],
  battlefieldCardState: string,
  exileCardState: string,
  libraryCardState: string,
  graveyardCardState: string,
  mustBeCommander: boolean,
  card: undefined,
}

export type FeatureSubmissionType = {
  feature: string,
}

export const defaultSubmissionCard: SubmissionCardType = {
  card: "",
  zoneLocations: [],
  battlefieldCardState: "",
  exileCardState: "",
  libraryCardState: "",
  graveyardCardState: "",
  mustBeCommander: false,
  template: undefined,
}

export const defaultTemplateSubmission: TemplateSubmissionType = {
  template: "",
  zoneLocations: [],
  battlefieldCardState: "",
  exileCardState: "",
  libraryCardState: "",
  graveyardCardState: "",
  mustBeCommander: false,
  card: undefined,
}

export const defaultFeatureSubmission: FeatureSubmissionType = {
  feature: "",
}
