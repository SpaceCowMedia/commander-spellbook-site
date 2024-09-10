import { CardInVariant, TemplateInVariant } from '@spacecowmedia/spellbook-client';

export type NewPrerequisiteType = {
  // TODO: rename with a better name
  z: string; // zone either H, B, C, G, L, E or multi
  s: string; // prerequisite string
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
