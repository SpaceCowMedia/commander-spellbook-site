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

export type ComboSubmissionErrorType = Record<string, (ComboSubmissionErrorType | string)[]> & {
  statusCode: number;
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
  return 'card' in card ? card.card.name.split(', ')[0] : card.template.name;
}

export function getTypes(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? card.card.typeLine : '';
}

/* `CardInVariant.usedFace` is a 1-based face index, so the back of a double-faced card is face 2.
   Split cards and adventures are multi-faced too, but their faces all live on the front image. */
export const BACK_FACE_INDEX = 2;
export const FACE_SEPARATOR = ' // ';

/* Which face a tooltip should lead with when `text` is the prose that mentions `card`. Naming a
   single face wins over `usedFace`; the full "front // back" name defers to it. */
export function getFaceMentionedBy(card: CardInVariant, text: string): number | null {
  if (card.card.faces <= 1) {
    return card.usedFace;
  }
  const mentioned = card.card.name.split(FACE_SEPARATOR).indexOf(text.trim());
  return mentioned < 0 ? card.usedFace : mentioned + 1;
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
