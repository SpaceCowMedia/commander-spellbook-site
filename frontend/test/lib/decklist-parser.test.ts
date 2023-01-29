import scryfall from "scryfall-client";
import {
  convertDecklistToDeck,
  findCombosFromDecklist,
} from "@/lib/decklist-parser";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import lookup from "@/lib/api/spellbook-api";

import type { FormattedApiResponse } from "@/lib/api/types";

jest.mock("scryfall-client");
jest.mock("@/lib/api/spellbook-api");

describe("decklist-parser", () => {
  let combos: FormattedApiResponse[];

  describe("convertDecklistToDeck", () => {
    beforeEach(() => {
      // TODO update scryfall-client to return helpers for creating mock data
      jest.mocked(scryfall.getCollection).mockResolvedValue([] as any);
    });

    it("converts decklist text to array of card names", async () => {
      const { cards } = await convertDecklistToDeck(`Foo
Bar
Baz
Biz Baz`);

      expect(cards).toEqual(["Foo", "Bar", "Baz", "Biz Baz"]);
    });

    it("filters out blank entries", async () => {
      const { cards } = await convertDecklistToDeck(`Foo

Bar

Baz
    
Biz Baz`);

      expect(cards).toEqual(["Foo", "Bar", "Baz", "Biz Baz"]);
    });

    it("filters out entries that start with //", async () => {
      const { cards } = await convertDecklistToDeck(`Foo
Bar
// Commander
Baz
Biz Baz`);

      expect(cards).toEqual(["Foo", "Bar", "Baz", "Biz Baz"]);
    });

    it("removes spaces from beginning and end of entry", async () => {
      const { cards } = await convertDecklistToDeck(`    Foo
Bar    
  Baz
Biz Baz `);

      expect(cards).toEqual(["Foo", "Bar", "Baz", "Biz Baz"]);
    });

    it("removes leading numbers", async () => {
      const { cards } = await convertDecklistToDeck(`1 Foo
2 Bar
34 Baz
9876543210 Biz Baz`);

      expect(cards).toEqual(["Foo", "Bar", "Baz", "Biz Baz"]);
    });

    it("removes leading numbers in the form <digit>x", async () => {
      const { cards } = await convertDecklistToDeck(`1x Foo
2x Bar
34x Baz
9876543210x Biz Baz`);

      expect(cards).toEqual(["Foo", "Bar", "Baz", "Biz Baz"]);
    });

    it("removes set/data & collector number data (anything after a parenthesis)", async () => {
      const { cards } = await convertDecklistToDeck(`Foo (foo) 123
Bar (anything
34x Baz ) I stay here
Biz Baz ()`);

      expect(cards).toEqual(["Foo", "Bar", "Baz ) I stay here", "Biz Baz"]);
    });

    it("provides count of total cards in deck", async () => {
      const { numberOfCards } = await convertDecklistToDeck(`Foo (foo) 123
Bar (anything
34x Baz ) I stay here
1 Biz Baz ()`);

      expect(numberOfCards).toBe(37);
    });

    it("provides color identity of deck", async () => {
      jest
        .mocked(scryfall.getCollection)
        .mockResolvedValue([
          { color_identity: ["w"] },
          { color_identity: ["r"] },
          { color_identity: ["g", "w"] },
        ] as any);

      const { colorIdentity } = await convertDecklistToDeck(`Foo (foo) 123
Bar (anything
34x Baz ) I stay here
1 Biz Baz ()`);

      expect(colorIdentity).toEqual(["w", "r", "g"]);
    });

    it("provides a WUBRG color identity if the Scryfall request fails", async () => {
      jest.mocked(scryfall.getCollection).mockRejectedValue(new Error("fail"));

      const { colorIdentity } = await convertDecklistToDeck(`Foo (foo) 123
Bar (anything
34x Baz ) I stay here
1 Biz Baz ()`);

      expect(colorIdentity).toEqual(["w", "u", "b", "r", "g"]);
    });
  });

  describe("findCombosFromDecklist", () => {
    beforeEach(() => {
      combos = [
        makeFakeCombo({
          commanderSpellbookId: "1",
          cards: ["Card 1", "Card 2"],
          colorIdentity: "r,g",
          prerequisites: ["Step 1. Step 2"],
          steps: ["Step 1. Step 2"],
          results: ["Step 1. Step 2"],
        }),
        makeFakeCombo({
          commanderSpellbookId: "2",
          cards: ["Card 3", "Card 4"],
          colorIdentity: "w,b,r",
          prerequisites: ["Step 1.", "Step 2"],
          steps: ["Step 1.", "Step 2"],
          results: ["Step 1.", "Step 2"],
        }),
      ];
      jest.mocked(lookup).mockResolvedValue(combos);
    });

    it("returns an empty array for combos if decklist does not contain any combos", async () => {
      const data = await findCombosFromDecklist(["foo", "bar"]);

      expect(data.combosInDecklist).toEqual([]);
    });

    it("returns an array of combo data for combos contained in the decklist", async () => {
      const data = await findCombosFromDecklist([
        "Card 3",
        "Card 1",
        "Card Baz",
        "Card Bar",
        "Card 4",
        "Card Foo",
      ]);

      expect(data.combosInDecklist.length).toEqual(1);
      expect(data.combosInDecklist[0].commanderSpellbookId).toBe("2");
    });

    it("returns an empty array for potential combos if decklist does not contain any combos missing 1 card", async () => {
      const data = await findCombosFromDecklist(["foo", "bar"]);

      expect(data.potentialCombos).toEqual([]);
      expect(data.missingCardsForPotentialCombos).toEqual([]);
    });

    it("returns an array of potential combo data for combos where only one card is missing", async () => {
      const data = await findCombosFromDecklist([
        "Card 3",
        "Card foo",
        "Card 2",
        "Card Baz",
        "Card Bar",
      ]);

      expect(data.potentialCombos.length).toEqual(2);
      expect(data.potentialCombos[0].commanderSpellbookId).toBe("1");
      expect(data.potentialCombos[1].commanderSpellbookId).toBe("2");
      expect(data.missingCardsForPotentialCombos.length).toBe(2);
      expect(data.missingCardsForPotentialCombos[0].name).toBe("Card 1");
      expect(data.missingCardsForPotentialCombos[1].name).toBe("Card 4");
    });
  });
});
