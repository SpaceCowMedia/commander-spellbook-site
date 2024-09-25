import { ComboPrerequisites, getName, getNameBeforeComma } from './types';
import { CardInVariant, TemplateInVariant, Variant } from '@spacecowmedia/spellbook-client';

const ZONE_MAP = {
  H: 'in hand',
  B: 'on the battlefield',
  C: 'in the command zone',
  G: 'in your graveyard',
  L: 'in your library',
  E: 'in exile',
};

const comaAndOrJoin = (input: string[], joiner = 'and') => {
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
};

const getZoneStateMap = (card: CardInVariant | TemplateInVariant) => {
  const output: Record<string, string> = {};
  if (card.battlefieldCardState) {
    output['B'] = card.battlefieldCardState;
  }
  if (card.exileCardState) {
    output['E'] = card.exileCardState;
  }
  if (card.graveyardCardState) {
    output['G'] = card.graveyardCardState;
  }
  if (card.libraryCardState) {
    output['L'] = card.libraryCardState;
  }
  return output;
};

export const getPrerequisiteList = (variant: Variant): ComboPrerequisites[] => {
  let output: ComboPrerequisites[] = [];

  const cardsAndTemplates: Array<CardInVariant | TemplateInVariant> = (
    variant.uses as Array<CardInVariant | TemplateInVariant>
  )
    .concat(variant.requires)
    .map((card) => {
      if ('card' in card) {
        return { ...card, name: card.card.name };
      } else {
        return { ...card, name: card.template.name };
      }
    });

  // Count if any coma split card names exist more than once
  const cardNameCountMap = cardsAndTemplates.reduce((acc: Record<string, number>, card) => {
    const split = getNameBeforeComma(card);
    acc[split] = acc[split] ? acc[split] + 1 : 1;
    return acc;
  }, {});

  // Map card names to coma split card names if they only exist once
  const cardNameMap = cardsAndTemplates.reduce((acc: Record<string, string>, card) => {
    const name = getName(card);
    const split = getNameBeforeComma(card);
    acc[name] = cardNameCountMap[split] === 1 ? split : name;
    return acc;
  }, {});

  // Handle any multi-zone cards
  const multiZoneCards = cardsAndTemplates.filter((card) => card.zoneLocations.length > 1);
  for (const card of multiZoneCards.sort((a, b) => getName(a).localeCompare(getName(b)))) {
    let cardString = '';
    cardString += `${cardNameMap[getName(card)]} `;
    if (Object.keys(ZONE_MAP).length === card.zoneLocations.length) {
      cardString += 'in any zone';
    } else {
      cardString += card.zoneLocations.map((zone) => ZONE_MAP[zone as keyof typeof ZONE_MAP]).join(' or ');
    }
    const combinedStateString = comaAndOrJoin(Object.values(getZoneStateMap(card)));
    if (combinedStateString) {
      cardString += ` (${combinedStateString})`;
    }
    cardString += '. ';
    output.push({ zones: 'multi', description: cardString });
  }
  const singleZoneCards = cardsAndTemplates.filter((card) => card.zoneLocations.length === 1);

  const zoneGroups: {
    cardNames: string[];
    cardState: string;
    zone: keyof typeof ZONE_MAP;
  }[] = [];

  // Sort cards into groups by zone
  for (const zoneKey in ZONE_MAP) {
    const zoneCards = singleZoneCards.filter((card) => card.zoneLocations[0] === zoneKey);
    if (zoneCards.length === 0) {
      continue;
    }
    // Pull out the card state for the current zone and if it exists store the card name in an array with the key of the card state string so it can be grouped with cards that match its state
    const stateMap = zoneCards.reduce((acc: Record<string, string[]>, card) => {
      const cardState = getZoneStateMap(card)[zoneKey];
      if (cardState) {
        const name = getName(card);
        acc[cardState] = acc[cardState] ? acc[cardState].concat([cardNameMap[name]]) : [cardNameMap[name]];
      }
      return acc;
    }, {});
    let cardStateStrings: string[] = [];
    for (const stateKey in stateMap) {
      let cardStateString = comaAndOrJoin(stateMap[stateKey]);
      if (stateKey) {
        cardStateString += ` ${stateKey}`;
      }
      cardStateStrings.push(cardStateString);
    }
    let cardState = comaAndOrJoin(cardStateStrings);
    if (cardState) {
      cardState = ` (${cardState})`;
    }
    zoneGroups.push({
      cardNames: zoneCards.map((card) => cardNameMap[getName(card)]),
      zone: zoneKey as keyof typeof ZONE_MAP,
      cardState,
    });
  }

  let index = 0;
  for (const zoneGroup of zoneGroups.sort((a, b) => (a.cardNames.length > b.cardNames.length ? 1 : -1))) {
    const cards = zoneGroup.cardNames;
    // If this is the last zone group, and it has more than 2 cards, swap card names for combinations string
    if (index === zoneGroups.length - 1 && cards.length > 2) {
      output.push({
        zones: zoneGroup.zone,
        description: `All${zoneGroups.length + multiZoneCards.length > 1 ? ' other' : ''} ${zoneGroup.zone === 'B' ? 'permanents' : 'cards'} ${ZONE_MAP[zoneGroup.zone]}${zoneGroup.cardState}`,
      });
    } else {
      // Otherwise just list the cards
      output.push({
        zones: zoneGroup.zone,
        description:
          (cards.length < 3 ? cards.join(' and ') : cards.slice(0, -1).join(', ') + ' and ' + cards.slice(-1)) +
          ' ' +
          ZONE_MAP[zoneGroup.zone] +
          zoneGroup.cardState,
      });
    }
    index++;
  }

  // Add any other prerequisites
  if (variant.otherPrerequisites) {
    variant.otherPrerequisites
      .split(/\.\s+/gi)
      .forEach((prereq) => output.push({ zones: 'other', description: prereq }));
  }
  if (variant.manaNeeded) {
    output.push({ zones: 'mana', description: `${variant.manaNeeded} available` });
  }

  return output;
};
