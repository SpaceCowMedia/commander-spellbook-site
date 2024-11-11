import { CardInVariant, TemplateInVariant } from '@spacecowmedia/spellbook-client';

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
