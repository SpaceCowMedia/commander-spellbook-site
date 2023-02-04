import scryfall from "scryfall-client";
import lookup from "@/lib/api/spellbook-api";

import type {
  FormattedApiResponse,
  ColorIdentityColors,
} from "@/lib/api/types";
import type Card from "@/lib/api/models/card";

// this is a little complicated, but basically
// we pull off the quantity for the card (if any)
// when the card is in one of the following forms
// * 123 Card Name
// * 123x Card Name
// * 123X Card Name
// this is saved as the second match in the array
// returned by the match method, the card name is
// saved in the 3rd match
const DECK_ENTRY_REGEX = /^\s*(?:(?<count>\d+)x?\s+)?(?<name>[^/\s].+?)\s*(?:\(.*)?$/;

type CombosInDecklist = {
  combosInDecklist: FormattedApiResponse[];
  potentialCombos: FormattedApiResponse[];
  missingCardsForPotentialCombos: Card[];
};

type Deck = {
  cards: string[];
  numberOfCards: number;
  colorIdentity: ColorIdentityColors[];
};

function findMissingCards(decklist: string[], cardsInCombo: Card[]): Card[] {
  const missingCards: Card[] = [];

  cardsInCombo.forEach((card) => {
    if (missingCards.length > 1) {
      // no need to keep checking if we know up front
      // that we're missing more than one card
      return;
    }

    const cardIsInDeck = decklist.find((cardName) => {
      return card.matchesNameExactly(cardName);
    });

    if (!cardIsInDeck) {
      missingCards.push(card);
    }
  });

  return missingCards;
}

async function getColorIdentityFromDeck(
  cards: string[]
): Promise<ColorIdentityColors[]> {
  try {
    const cardsFromScryfall = await scryfall.getCollection(
      cards.map((cardName) => {
        return {
          name: cardName,
        };
      })
    );
    const colorsAsSet = cardsFromScryfall.reduce((identity, card) => {
      card.color_identity.forEach((color: ColorIdentityColors) => {
        // Scryfall's color identity value is capitalized
        identity.add(color.toLowerCase());
      });

      return identity;
    }, new Set());

    return Array.from(colorsAsSet) satisfies ColorIdentityColors[];
  } catch (err) {
    // in case we encounter an error in Scryfall
    // best to just default to a WUBRG identity
    return ["w", "u", "b", "r", "g"];
  }
}

export async function convertDecklistToDeck(decklist: string): Promise<Deck> {
  const deck = decklist
    .split("\n")
    .reduce<Pick<Deck, "cards" | "numberOfCards">>(
      (result, line) => {
        const { count, name } = line.match(DECK_ENTRY_REGEX)?.groups || {};

        if (name) {
          result.numberOfCards += Number(count) || 1;
          result.cards.push(name);
        }

        return result;
      },
      {
        cards: [],
        numberOfCards: 0,
      },
    );

  const colorIdentity = await getColorIdentityFromDeck(deck.cards);

  return {
    ...deck,
    colorIdentity,
  };
}

// this function loops through the entire combo database
// to pull out any combos where the entire set of cards
// are available in the provided decklist
// and any combos where only a single card is missing
export async function findCombosFromDecklist(
  decklist: string[]
): Promise<CombosInDecklist> {
  const combos = await lookup();
  const combosInDecklist: FormattedApiResponse[] = [];
  const potentialCombos: FormattedApiResponse[] = [];
  const missingCardsForPotentialCombos: Card[] = [];

  combos.forEach((combo) => {
    const missingCards = findMissingCards(decklist, combo.cards);

    if (missingCards.length === 0) {
      combosInDecklist.push(combo);
    } else if (missingCards.length === 1) {
      potentialCombos.push(combo);
      missingCardsForPotentialCombos.push(missingCards[0]);
    }
  });

  return {
    combosInDecklist,
    potentialCombos,
    missingCardsForPotentialCombos,
  };
}
