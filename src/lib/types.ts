import {
  Card,
  CardInVariant,
  LayoutRotationEnum,
  TemplateInVariant,
  VariantSuggestion,
  VariantUpdateSuggestion,
} from '@space-cow-media/spellbook-client';

export interface ComboPrerequisites {
  /* The zones a card starts in (H, B, C, G, L, E), or the one section the entry belongs to instead:
     commander, easy, notable or mana */
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

/* `CardInVariant.usedFace` is a 1-based face index, so the back of a double-faced card is face 2.
   Split cards and adventures are multi-faced too, but their faces all live on the front image. */
export const FRONT_FACE_INDEX = 1;
export const BACK_FACE_INDEX = 2;
export const FACE_SEPARATOR = ' // ';

export function getFaceNames(name: string): string[] {
  return name.split(FACE_SEPARATOR);
}

/* Only a legendary name is built as "<who>, <title>", so only there does the part before the comma
   name the card on its own: a comma anywhere else separates words of one whole name, as in
   "Fear, Fire, Foes!". */
export function isLegendary(typeLine: string): boolean {
  return typeLine.toLowerCase().includes('legendary');
}

/* The informal ways prose refers to a card or to one of its faces, e.g. "Sorin, Ravenous Neonate"
   as "Sorin" or "The Gitrog Monster" as "Gitrog". */
export function getShortNames(name: string, typeLine: string): string[] {
  if (isLegendary(typeLine) && name.match(/^[^,]+,/)) {
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

/* The name of a single face, e.g. face 2 of "Delver of Secrets // Insectile Aberration" is
   "Insectile Aberration". A card with one face, or a face index that names no face, keeps its
   whole name. */
export function getFaceName(card: Card, face?: number | null): string {
  if (face == null || card.faces <= 1) {
    return card.name;
  }
  return getFaceNames(card.name)[face - 1] ?? card.name;
}

/* How prose should name a card a combo only uses one face of. Templates have no faces. */
export function getUsedFaceName(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? getFaceName(card.card, card.usedFace) : getName(card);
}

/* How a list names a card: the whole card, followed by the face a combo narrows it down to. */
export function getNameWithUsedFace(card: CardInVariant | TemplateInVariant): string {
  const name = getName(card);
  const faceName = getUsedFaceName(card);
  return faceName === name ? name : `${name} as ${faceName}`;
}

/* The type line of a single face, e.g. "Land" for the back of "Bala Ged Recovery // Bala Ged
   Sanctuary". Type lines split per face with the same separator as names, but only when there is
   one of them per face: some layouts describe every face in a single type line. */
export function getFaceTypes(card: Card, face?: number | null): string {
  const faceTypes = card.typeLine.split(FACE_SEPARATOR);
  if (face == null || faceTypes.length !== card.faces) {
    return card.typeLine;
  }
  return faceTypes[face - 1] ?? card.typeLine;
}

/* The type line of the face a combo uses. Templates have no type line. */
export function getUsedFaceTypes(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? getFaceTypes(card.card, card.usedFace) : '';
}

const BATTLEFIELD_ZONE = 'B';

/* A card enters as its first face and has to be turned to become another one: a double-faced card
   keeps its other faces on the back of the physical card, which is why it is the only layout with a
   back image, and a flip card keeps them upside down. Split cards and adventures print every face
   on the front instead, so naming one of their faces already names what sits on the table. */
function usesFaceOfTurnableCard(card: CardInVariant | TemplateInVariant): card is CardInVariant {
  return (
    'card' in card &&
    card.usedFace != null &&
    card.card.faces > 1 &&
    (card.card.imageUriBackNormal != null || card.card.layoutRotationFront === LayoutRotationEnum.Flip)
  );
}

interface CardNaming {
  /* how prose names the card */
  name: string;
  /* the type line of the named face, which decides how that name shortens */
  typeLine: string;
  /* the face a combo turns the card to, when it uses one the card does not enter as */
  turnedFaceName?: string;
}

/* Only the battlefield holds a card turned to another face, so everywhere else the whole card,
   front face up, is what is there. */
function getCardNaming(card: CardInVariant | TemplateInVariant): CardNaming {
  if (!usesFaceOfTurnableCard(card)) {
    return { name: getUsedFaceName(card), typeLine: getUsedFaceTypes(card) };
  }
  const typeLine = getFaceTypes(card.card, FRONT_FACE_INDEX);
  const usedFaceName = getUsedFaceName(card);
  const isTurned =
    card.usedFace !== FRONT_FACE_INDEX &&
    card.zoneLocations.includes(BATTLEFIELD_ZONE) &&
    usedFaceName !== getName(card);
  return isTurned
    ? { name: getFaceName(card.card, FRONT_FACE_INDEX), typeLine, turnedFaceName: usedFaceName }
    : { name: getName(card), typeLine };
}

/* How prose identifies the card an entry is about. */
export function getCardReference(card: CardInVariant | TemplateInVariant): string {
  return getCardNaming(card).name;
}

/* The face naming the card leaves out, which prose has to spell out on top of it. */
export function getTurnedFaceName(card: CardInVariant | TemplateInVariant): string | undefined {
  return getCardNaming(card).turnedFaceName;
}

/* Prose refers to a legendary card by the part of its name before the comma, when that is
   unambiguous: "Jace, Vryn's Prodigy // Jace, Telepath Unbound" is "Jace", while "Hanweir
   Battlements // Hanweir, the Writhing Township" has a non legendary front and keeps its whole
   name. */
export function getNameBeforeComma(card: CardInVariant | TemplateInVariant): string {
  const { name, typeLine } = getCardNaming(card);
  return isLegendary(typeLine) ? name.split(', ')[0] : name;
}

/* The art of the face a combo uses. Only a double-faced card has art of its own on the back. */
export function getUsedFaceArtCrop(card: CardInVariant): string | null {
  return card.usedFace === BACK_FACE_INDEX
    ? (card.card.imageUriBackArtCrop ?? card.card.imageUriFrontArtCrop)
    : card.card.imageUriFrontArtCrop;
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

/* Which face a tooltip should lead with when `text` is the prose that mentions `card`. The whole
   "front // back" name names the whole card, so it leads with the front the way the card is
   printed; naming a single face, by its full or short name, leads with that face; a short name
   shared by both faces defers to `usedFace`. */
export function getFaceMentionedBy(card: CardInVariant, text: string): number | null {
  if (card.card.faces <= 1) {
    return card.usedFace;
  }
  if (text.trim() === card.card.name) {
    return null;
  }
  const faceNames = getFaceNames(card.card.name);
  const mentioned = faceNames.indexOf(text.trim());
  if (mentioned >= 0) {
    return mentioned + 1;
  }
  const shortNameMatches = faceNames.flatMap((faceName, i) =>
    getShortNames(faceName, getFaceTypes(card.card, i + 1)).includes(text.trim()) ? [i + 1] : [],
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
