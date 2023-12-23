import scryfall from "scryfall-client";

import type {ColorIdentityColors} from "lib/types";

// this regex supports decks parsing in these formats:
// // a heading that starts with // gets ignored
// Card Name
// 1 Card Name
// 2x Card Name
// 3X Card Name
// 4        Card Name (any number of spaces before the card name)
// 5x       Card Name (any number of spaces before the card name)
// 5X       Card Name (any number of spaces before the card name)
// Card Name (set code) any other info here gets ignored after the set code
// 6x Card Name (set code) this gets treated the same way, of course
//
// --------------------------------------------------------------------------
// To understand how this regex works, let's break it down bit by bit
//
// ^\s*
//    any number of spaces at the beginning, including 0 spaces
//
// --------------------------------------------------------------------------
// (?:(?<count>\d+)[xX]?\s+)?
//    A capture group to discern the card quantity in the deck.
//    This one is a bit tricky, so let's break it down further
//
//    (?<count>\d+)
//      a capture group that gets named `count` that matches
//      any number of digits, where there is at least 1 digit
//
//    [xX]?
//      the characters x or X, and the ? after it indicates
//      that these characters may not be present at all
//
//    \s+
//      at least one space, but there can be any number
//
//    (?:)?
//      all of the previous are contained within these parens.
//      this syntax indicates that it wants match this group, but
//      not remember the match later. Basically, the only part
//      of this whole section that we actually want to use later
//      is the `count` one
//
// --------------------------------------------------------------------------
// (?<name>[^/\s].+?)
//    a capture group named `name` that starts with any character
//    that is not a space character or the / character, followed by
//    any other character after that
//    This allows us to ingnore headings or extraneous spaces/tabs
//
// --------------------------------------------------------------------------
// \s*
//   any number of spaces here, including 0 spaces
//
// --------------------------------------------------------------------------
// (?:[(#].*)?$
//   this can be broken down into:
//     (?:)?$
//        a non-remembered capture group that is both optional
//        and ends the line
//      [(#].*
//        a open paren or # followed any number of additional,
//        including no additional characters
//        this is how we find the set code syntax
//        as well as the tagging syntax
//        Note: there are magic cards that have `(` in the name
//        but none in black border, so this shouldn't be a problem
//        https://scryfall.com/search?extras=true&q=name%3A%22%28%22
// --------------------------------------------------------------------------
// future maintainers, I hope that helps a little
const DECK_ENTRY_REGEX =
  /^\s*(?:(?<count>\d+)[xX]?\s+)?(?<name>[^/\s].+?)\s*(?:[(#].*)?$/;

export type Deck = {
  cards: string[];
  numberOfCards: number;
  colorIdentity: ColorIdentityColors[];
};

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

    return Array.from(colorsAsSet) as ColorIdentityColors[];
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
      }
    );

  const colorIdentity = await getColorIdentityFromDeck(deck.cards);

  return {
    ...deck,
    colorIdentity,
  };
}

export function convertDecklistToArray(decklist: string): string[] {
  return decklist
    .split("\n")
    .reduce<string[]>((result, line) => {
        const { name } = line.match(DECK_ENTRY_REGEX)?.groups || {};

        if (name) result.push(name);
        return result;
      },
      [],
    );


}
