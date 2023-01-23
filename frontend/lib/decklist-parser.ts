import lookup from "@/lib/api/spellbook-api";

import type { FormattedApiResponse } from "@/lib/api/types";
import type Card from "@/lib/api/models/card";

type CombosInDecklist = {
  combosInDecklist: FormattedApiResponse[];
  potentialCombos: FormattedApiResponse[];
  missingCardsForPotentialCombos: Card[];
};

type Deck = {
  cards: string[];
  numberOfCards: number;
};

export function convertDecklistToDeck(decklist: string): Deck {
  let numberOfCardsInDeck = 0;

  const cards = decklist
    .split("\n")
    .filter((cardName) => {
      const normalizedCardName = cardName.trim();
      // filter out empty values and values that start with //
      // (common way to denote sections of a decklist, so it shouldn't
      // be considered part of the decklist)
      return normalizedCardName && !normalizedCardName.startsWith("//");
    })
    .map((cardName) => {
      // this is a little complicated, but basically
      // we pull off the quantity for the card (if any)
      // when the card is in one of the following forms
      // * 123 Card Name
      // * 123x Card Name
      // * 123X Card Name
      // this is saved as the second match in the array
      // returned by the match method, the card name is
      // saved in the 3rd match
      // it's technically possible for match to return null
      // so we need to default to an empty array to destructure
      // the variables
      const [, quantityAsString, name] =
        cardName.match(/^(\d*[xX]?\s)?(.*)$/) || [];
      // if the quantity doesn't exist, then we default to 1
      // and we remove the x (lowercase or uppercase)
      // before casting it to a number
      const quantity = Number((quantityAsString || "1").replace(/x/i, ""));

      numberOfCardsInDeck += quantity;

      return name;
    })
    .map((cardName) => {
      // removes set name or collector data, which we assume
      // is anything after a space followed by an open parenthesis
      // NOTE: there are a handful of magic cards that use ( in the
      // the name, but they are all silver border so far and unlikely
      // to be present in the Commander Spellbook database
      return cardName.split(" (")[0].trim();
    });

  return {
    numberOfCards: numberOfCardsInDeck,
    cards,
  };
}

export async function findCombosFromDecklist(
  decklist: string[]
): Promise<CombosInDecklist> {
  const combos = await lookup();
  const combosInDecklist: FormattedApiResponse[] = [];
  const potentialCombos: FormattedApiResponse[] = [];
  const missingCardsForPotentialCombos: Card[] = [];

  combos.forEach((combo) => {
    const missingCards: Card[] = [];

    combo.cards.forEach((card) => {
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
