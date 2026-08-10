import {
  CardInVariant,
  TemplateInVariant,
  VariantSuggestion,
  VariantUpdateSuggestion,
} from '@space-cow-media/spellbook-client';

export interface ComboPrerequisites {
  /* Zone either H, B, C, G, L, E or multiple of them */
  zones: string[];
  /* Additional description of the prerequisite */
  description: string;
}

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

export function getName(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? card.card.name : card.template.name;
}

export function getNameBeforeComma(card: CardInVariant | TemplateInVariant): string {
  const name = getName(card);
  return 'card' in card ? name.split(', ')[0] : name;
}

export function getTypes(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? card.card.typeLine : '';
}

/* `CardInVariant.usedFace` is a 1-based face index, so the back of a double-faced card is face 2.
   Split cards and adventures are multi-faced too, but their faces all live on the front image. */
export const BACK_FACE_INDEX = 2;
export const FACE_SEPARATOR = ' // ';

export function getFaceNames(name: string): string[] {
  return name.split(FACE_SEPARATOR);
}

/* The informal ways prose refers to a card or to one of its faces, e.g. "Sorin, Ravenous Neonate"
   as "Sorin" or "The Gitrog Monster" as "Gitrog". */
export function getShortNames(name: string): string[] {
  if (name.match(/^[^,]+,/)) {
    return [name.split(',')[0]];
  }
  if (name.match(/^[^\s]+\s(the|of)\s/i)) {
    return [name.split(/\s(the|of)/i)[0]];
  }
  if (name.match(/^the\s/i)) {
    const restOfName = name.split(/^the\s/i)[1];
    return [restOfName, restOfName.split(' ')[0]];
  }
  return [];
}

/* Templates named "<summary>: <details>" are often mentioned by their summary only. A colon inside
   quotes belongs to a quoted ability, not to a summary. */
export function getTemplateNameSummary(name: string): string | undefined {
  let insideQuotes = false;
  for (let i = 0; i < name.length; i++) {
    if (name[i] === '"') {
      insideQuotes = !insideQuotes;
    } else if (name[i] === ':' && !insideQuotes) {
      return name.substring(0, i).trim() || undefined;
    }
  }
  return undefined;
}

/* Which face a tooltip should lead with when `text` is the prose that mentions `card`. Naming a
   single face, by its full or short name, wins over `usedFace`; the full "front // back" name and
   a short name shared by both faces defer to it. */
export function getFaceMentionedBy(card: CardInVariant, text: string): number | null {
  if (card.card.faces <= 1) {
    return card.usedFace;
  }
  const faceNames = getFaceNames(card.card.name);
  const mentioned = faceNames.indexOf(text.trim());
  if (mentioned >= 0) {
    return mentioned + 1;
  }
  const shortNameMatches = faceNames.flatMap((faceName, i) =>
    getShortNames(faceName).includes(text.trim()) ? [i + 1] : [],
  );
  return shortNameMatches.length === 1 ? shortNameMatches[0] : card.usedFace;
}

export interface LegalityFormat {
  value: string;
  label: string;
}

export const LEGALITY_FORMATS: LegalityFormat[] = [
  {
    value: '',
    label: '-',
  },
  {
    value: 'commander',
    label: 'EDH/Commander',
  },
  {
    value: 'pauper_commander',
    label: 'Pauper EDH/Commander (including uncommon commanders)',
  },
  {
    value: 'pauper_commander_main',
    label: 'Pauper EDH/Commander (excluding uncommon commanders)',
  },
  {
    value: 'oathbreaker',
    label: 'Oathbreaker',
  },
  {
    value: 'predh',
    label: 'Pre-EDH/Commander',
  },
  {
    value: 'standard_brawl',
    label: 'Standard Brawl',
  },
  {
    value: 'brawl',
    label: 'Brawl / Historic Brawl',
  },
  {
    value: 'competitive_brawl',
    label: 'Competitive Brawl',
  },
  {
    value: 'alchemy',
    label: 'Alchemy',
  },
  {
    value: 'vintage',
    label: 'Vintage',
  },
  {
    value: 'legacy',
    label: 'Legacy',
  },
  {
    value: 'premodern',
    label: 'Premodern',
  },
  {
    value: 'modern',
    label: 'Modern',
  },
  {
    value: 'pioneer',
    label: 'Pioneer',
  },
  {
    value: 'standard',
    label: 'Standard',
  },
  {
    value: 'pauper',
    label: 'Pauper',
  },
];
