import { CardInVariant, TemplateInVariant } from '@space-cow-media/spellbook-client';

export type ComboPrerequisites = {
  /* Zone either H, B, C, G, L, E or multiple of them */
  zones: string[];
  /* Additional description of the prerequisite */
  description: string;
};

export type ComboSubmissionErrorType = {
  [key: string]: (ComboSubmissionErrorType | string)[];
} & { statusCode: number };

export function getName(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? card.card.name : card.template.name;
}

export function getNameBeforeComma(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? card.card.name.split(', ')[0] : card.template.name;
}

export function getTypes(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? card.card.typeLine : '';
}

export type LegalityFormat = {
  value: string;
  label: string;
};

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
    value: 'brawl',
    label: 'Brawl',
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
