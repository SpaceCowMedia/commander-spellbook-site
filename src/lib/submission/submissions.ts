import { VariantSuggestion, VariantUpdateSuggestion } from '@space-cow-media/spellbook-client';

/*
 * A node of the error body of an HTTP 400 response: either a message, a list of nodes, or a map
 * from field name to node. List fields map the index of the failing item to its errors instead,
 * e.g. `{"uses": {"0": {"card": ["This field may not be blank."]}}}`, and use non numeric keys
 * (`nonFieldErrors`) for the errors of the list itself.
 */
export type ErrorDetail = string | ErrorDetail[] | { [key: string]: ErrorDetail };

export type ComboSubmissionErrorType = Record<string, ErrorDetail> & {
  /* Set by the client, not part of the response body */
  statusCode?: number;
  detail?: string;
};

export type ComboSubmission = Omit<VariantSuggestion, 'created'> & {
  created: string;
};

export type UpdateSubmission = Omit<VariantUpdateSuggestion, 'created'> & {
  created: string;
};

export function variantUpdateSuggestionToSubmission(variantSuggestion: VariantUpdateSuggestion): UpdateSubmission {
  return {
    ...variantSuggestion,
    created: variantSuggestion.created.toISOString(),
  };
}

export function variantUpdateSuggestionFromSubmission(comboSubmission: UpdateSubmission): VariantUpdateSuggestion {
  return {
    ...comboSubmission,
    created: new Date(comboSubmission.created),
  };
}

export function variantSuggestionToSubmission(variantSuggestion: VariantSuggestion): ComboSubmission {
  return {
    ...variantSuggestion,
    created: variantSuggestion.created.toISOString(),
  };
}

export function variantSuggestionFromSubmission(comboSubmission: ComboSubmission): VariantSuggestion {
  return {
    ...comboSubmission,
    created: new Date(comboSubmission.created),
  };
}
