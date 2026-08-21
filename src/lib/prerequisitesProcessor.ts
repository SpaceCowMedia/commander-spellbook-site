import {
  ComboPrerequisites,
  getCardReference,
  getName,
  getNameBeforeComma,
  getUsedFaceName,
  getUsedFaceTypes,
  usesOneFaceOfDoubleFacedCard,
} from './types';
import { CardInVariant, TemplateInVariant, Variant } from '@space-cow-media/spellbook-client';

const NONPERMANENT_TYPES = ['instant', 'sorcery'];

const ZONE_MAP = {
  H: 'in hand',
  B: 'on the battlefield',
  C: 'in the command zone',
  G: 'in your graveyard',
  L: 'in your library',
  E: 'in exile',
};

function comaAndOrJoin(input: string[], joiner = 'and') {
  if (input.length === 0) {
    return '';
  }
  if (input.length === 1) {
    return input[0];
  }
  if (input.length === 2) {
    return input.join(` ${joiner} `);
  }
  return `${input.slice(0, -1).join(', ')}, ${joiner} ${input.slice(-1)}`;
}

function getCardState(card: CardInVariant | TemplateInVariant) {
  const output: { zone: keyof typeof ZONE_MAP; state: string }[] = [];
  if (card.battlefieldCardState) {
    output.push({ zone: 'B', state: card.battlefieldCardState });
  }
  if (card.exileCardState) {
    output.push({ zone: 'E', state: card.exileCardState });
  }
  if (card.graveyardCardState) {
    output.push({ zone: 'G', state: card.graveyardCardState });
  }
  if (card.libraryCardState) {
    output.push({ zone: 'L', state: card.libraryCardState });
  }
  if (output.length === 0) {
    return '';
  }
  if (output.length === 1) {
    return output[0].state;
  }
  return comaAndOrJoin(
    output.map((o) => `${o.state} ${ZONE_MAP[o.zone]}`),
    'or',
  );
}

type Card = (CardInVariant | TemplateInVariant) & {
  /* the whole "front // back" name, which identifies the entry */
  name: string;
  /* how the prerequisites refer to the card, before it is shortened */
  reference: string;
  /* the face of a double-faced card the combo uses, which its reference has to spell out */
  usedFaceName?: string;
  type: string;
};

/* The clauses a zone group adds after its cards, e.g. "(as Petty Theft and tapped)". */
function detailsBit(details: string[]): string {
  return details.length ? ` (${comaAndOrJoin(details)})` : '';
}

/* Templates have no type line, so they are assumed to stay on the battlefield. */
function isPermanent(card: Card): boolean {
  return !NONPERMANENT_TYPES.some((type) => card.type.toLowerCase().includes(type));
}

/* Prerequisites come as one blob of sentences, each of which is listed on its own. */
function splitPrerequisites(prerequisites: string): string[] {
  return prerequisites.split(/\.\s+/gi).filter((s) => s.trim().length > 0);
}

export const getPrerequisiteList = (variant: Variant): ComboPrerequisites[] => {
  const cardsAndTemplates: Card[] = (variant.uses as (CardInVariant | TemplateInVariant)[])
    .concat(variant.requires)
    .map((card) => ({
      ...card,
      name: getName(card),
      reference: getCardReference(card),
      usedFaceName: usesOneFaceOfDoubleFacedCard(card) ? getUsedFaceName(card) : undefined,
      type: getUsedFaceTypes(card),
    }));

  // Count if any coma split card names exist more than once
  const cardNameCountMap = cardsAndTemplates.reduce((acc: Record<string, number>, card) => {
    const split = getNameBeforeComma(card);
    acc[split] = acc[split] ? acc[split] + 1 : 1;
    return acc;
  }, {});

  // Map card names to coma split card names if they only exist once
  const cardReferenceMap = cardsAndTemplates.reduce((acc: Record<string, string>, card) => {
    const split = getNameBeforeComma(card);
    acc[card.name] = cardNameCountMap[split] === 1 ? split : card.reference;
    return acc;
  }, {});

  // Spell out the face a combo uses of a double-faced card
  const cardNameMap = cardsAndTemplates.reduce((acc: Record<string, string>, card) => {
    const reference = cardReferenceMap[card.name];
    acc[card.name] = card.usedFaceName ? `${reference} (as ${card.usedFaceName})` : reference;
    return acc;
  }, {});

  // Handle zones descriptions
  const zonesToDescriptions: Record<string, string> = cardsAndTemplates.reduce((acc: Record<string, string>, card) => {
    const zoneKey = card.zoneLocations.join('');
    if (acc[zoneKey]) {
      return acc;
    }
    if (Object.keys(ZONE_MAP).length === card.zoneLocations.length) {
      acc[zoneKey] = 'in any zone';
    } else {
      acc[zoneKey] = card.zoneLocations.map((zone) => ZONE_MAP[zone as keyof typeof ZONE_MAP]).join(' or ');
    }
    return acc;
  }, {});

  // Sort cards into groups by zone
  const zoneGroups: { cards: Card[]; zones: string[]; cardState: string }[] = [];
  for (const zoneKey of Object.keys(zonesToDescriptions).toSorted((a, b) =>
    a.length == b.length
      ? a
          .split('')
          .map((c) => Object.keys(ZONE_MAP).indexOf(c).toString())
          .join('')
          .localeCompare(
            b
              .split('')
              .map((c) => Object.keys(ZONE_MAP).indexOf(c).toString())
              .join(''),
          )
      : a.length - b.length,
  )) {
    const zoneCards = cardsAndTemplates.filter((card) => card.zoneLocations.join('') === zoneKey);
    const reverseCardStateMap: Record<string, Card[]> = zoneCards.reduce((acc: Record<string, Card[]>, card) => {
      const state = getCardState(card);
      if (state) {
        if (acc[state]) {
          acc[state].push(card);
        } else {
          acc[state] = [card];
        }
      }
      return acc;
    }, {});
    const cardStateStrings = Object.keys(reverseCardStateMap).map(
      (stateKey) =>
        (zoneCards.length > 1 && reverseCardStateMap[stateKey].length < zoneCards.length
          ? comaAndOrJoin(reverseCardStateMap[stateKey].map((card) => cardNameMap[card.name])) + ' '
          : '') + stateKey,
    );
    const cardState = comaAndOrJoin(cardStateStrings);
    zoneGroups.push({
      cards: zoneCards,
      zones: zoneKey.split(''),
      cardState,
    });
  }
  let index = 0;
  const output: ComboPrerequisites[] = [];
  for (const zoneGroup of zoneGroups.sort((a, b) => a.cards.length - b.cards.length)) {
    const cards = zoneGroup.cards.map(
      (card) => `${card.quantity > 1 ? `${card.quantity}x ` : ''}${cardNameMap[card.name]}`,
    );
    // If this is the last zone group, and it has more than 2 cards, swap card names for combinations string
    const stateDetails = zoneGroup.cardState ? [zoneGroup.cardState] : [];
    if (index === zoneGroups.length - 1 && zoneGroup.cards.length > 2) {
      const otherGroups = zoneGroups.slice(0, -1);
      const otherGroupsHaveAPermanent = otherGroups.some((g) => g.cards.some(isPermanent));
      const thisGroupIsOfPermanents = zoneGroup.cards.every(isPermanent);
      // The collapsed wording names no card, so a card used as one of its faces has to say so here
      const usedFaceDetails = zoneGroup.cards.flatMap((card) =>
        card.usedFaceName ? [`${cardReferenceMap[card.name]} as ${card.usedFaceName}`] : [],
      );
      const description = `All${zoneGroups.length > 1 && (!thisGroupIsOfPermanents || otherGroupsHaveAPermanent) ? ' other' : ''} ${thisGroupIsOfPermanents ? 'permanents' : 'cards'} ${zonesToDescriptions[zoneGroup.zones.join('')]}${detailsBit(usedFaceDetails.concat(stateDetails))}.`;
      output.push({
        zones: zoneGroup.zones,
        description: description,
      });
    } else {
      // Otherwise just list the cards
      output.push({
        zones: zoneGroup.zones,
        description:
          (cards.length < 3 ? cards.join(' and ') : cards.slice(0, -1).join(', ') + ' and ' + cards.slice(-1)) +
          ' ' +
          zonesToDescriptions[zoneGroup.zones.join('')] +
          detailsBit(stateDetails) +
          '.',
      });
    }
    index++;
  }
  // Add any other prerequisites
  const commanders = cardsAndTemplates.filter((card) => card.mustBeCommander).map((card) => cardNameMap[card.name]);
  if (commanders.length > 0) {
    output.push({
      zones: ['commander'],
      description: `${comaAndOrJoin(commanders)} must be your commander${commanders.length > 1 ? 's' : ''}.`,
    });
  }

  if (variant.easyPrerequisites) {
    splitPrerequisites(variant.easyPrerequisites).forEach((prereq) =>
      output.push({ zones: ['easy'], description: prereq }),
    );
  }
  if (variant.notablePrerequisites) {
    splitPrerequisites(variant.notablePrerequisites).forEach((prereq) =>
      output.push({ zones: ['notable'], description: prereq }),
    );
  }

  if (variant.manaNeeded) {
    output.push({
      zones: ['mana'],
      description: `${variant.manaNeeded} available`,
    });
  }

  return output;
};

/* Easy prerequisites happen naturally in play, so counting them only makes a combo look harder than it is. */
export function countNotablePrerequisites(variant: Variant) {
  return variant.notablePrerequisites ? splitPrerequisites(variant.notablePrerequisites).length : 0;
}
