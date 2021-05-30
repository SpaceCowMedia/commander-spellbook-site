import CardGrouping from "@/lib/api/models/card-grouping";
import Card from "@/lib/api/models/card";
import getExternalCardData from "@/lib/get-external-card-data";

import { mocked } from "ts-jest/utils";

jest.mock("@/lib/get-external-card-data");

describe("CardGrouping", () => {
  beforeEach(() => {
    mocked(getExternalCardData).mockReturnValue({
      isBanned: false,
      isPreview: false,
      isFeatured: false,
      images: {
        oracle: "https://c1.scryfall.com/file/oracle.jpg",
        artCrop: "https://c1.scryfall.com/file/art.jpg",
      },
      prices: {
        tcgplayer: 123,
        cardkingdom: 456,
      },
      edhrecLink: "https://edhrec.com/card",
    });
  });

  it("has array methods", () => {
    expect.assertions(7);

    const group = CardGrouping.create();

    group.push(new Card("Card a"), new Card("Card b"), new Card("Card c"));

    expect(group.length).toBe(3);
    expect(group[0].name).toBe("Card a");
    expect(group[1].name).toBe("Card b");
    expect(group[2].name).toBe("Card c");
    group.forEach((item, index) => {
      expect(item).toBe(group[index]);
    });
  });

  describe("create", () => {
    it("makes a new card group from the strings", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.length).toBe(3);
      expect(group[0].name).toBe("Card a");
      expect(group[1].name).toBe("Card b");
      expect(group[2].name).toBe("Card c");
    });
  });

  describe("size", () => {
    it("returns the number of cards in grouping", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.length).toBe(3);
      expect(group.size()).toBe(3);
    });
  });

  describe("names", () => {
    it("retuns the names of cards in grouping as array", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.names()).toEqual(["Card a", "Card b", "Card c"]);
    });
  });

  describe("includesValue", () => {
    it("returns true when card grouping contains a partial name", () => {
      const group = CardGrouping.create(["foo", "bar", "baz"]);

      expect(group.includesValue("fo")).toBe(true);
    });

    it("returns false when card grouping does not contain a partial name", () => {
      const group = CardGrouping.create(["foo", "bar", "baz"]);

      expect(group.includesValue("bo")).toBe(false);
    });
  });

  describe("includesValueExactly", () => {
    it("returns true when card grouping contains a partial name", () => {
      const group = CardGrouping.create(["foo", "bar", "baz"]);

      expect(group.includesValueExactly("bar")).toBe(true);
    });

    it("returns false when card grouping does not contain a partial name", () => {
      const group = CardGrouping.create(["foo", "bar", "baz"]);

      expect(group.includesValueExactly("fo")).toBe(false);
    });
  });

  describe("isFeatured", () => {
    it("returns false if no cards are featured", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.isFeatured()).toBe(false);
    });

    it("returns true if at least one cards is featured", () => {
      jest
        .spyOn(Card.prototype, "isFeatured")
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.isFeatured()).toBe(true);
    });
  });

  describe("isBanned", () => {
    it("returns false if no cards are featured", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.isBanned()).toBe(false);
    });

    it("returns true if at least one cards is featured", () => {
      jest
        .spyOn(Card.prototype, "isBanned")
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.isBanned()).toBe(true);
    });
  });

  describe("isPreview", () => {
    it("returns false if no cards are featured", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.isPreview()).toBe(false);
    });

    it("returns true if at least one cards is featured", () => {
      jest
        .spyOn(Card.prototype, "isPreview")
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.isPreview()).toBe(true);
    });
  });

  describe("getPrice", () => {
    it("gets the combined tcgplayer price of the cards", () => {
      const spy = jest.spyOn(Card.prototype, "getPrice");
      spy.mockReturnValueOnce(1.01);
      spy.mockReturnValueOnce(2.34);
      spy.mockReturnValueOnce(3.14);

      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.getPrice("tcgplayer")).toBe(6.49);
      expect(spy).toBeCalledTimes(3);
      expect(spy).toBeCalledWith("tcgplayer");
      expect(spy).not.toBeCalledWith("cardkingdom");
    });

    it("gets the combined cardkingdom price of the cards", () => {
      const spy = jest.spyOn(Card.prototype, "getPrice");
      spy.mockReturnValueOnce(1.01);
      spy.mockReturnValueOnce(2.34);
      spy.mockReturnValueOnce(3.14);

      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.getPrice("cardkingdom")).toBe(6.49);
      expect(spy).toBeCalledTimes(3);
      expect(spy).toBeCalledWith("cardkingdom");
      expect(spy).not.toBeCalledWith("tcgplayer");
    });

    it("returns an empty string if any individual card price returns 0", () => {
      const spy = jest.spyOn(Card.prototype, "getPrice");
      spy.mockReturnValueOnce(1.01);
      spy.mockReturnValueOnce(0);
      spy.mockReturnValueOnce(3.14);

      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.getPrice("cardkingdom")).toBe(0);
    });
  });

  describe("getPriceAsString", () => {
    it("gets the combined tcgplayer price of the cards as a string", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      jest.spyOn(group, "getPrice").mockReturnValue(6.49);

      expect(group.getPriceAsString("tcgplayer")).toBe("6.49");
      expect(group.getPrice).toBeCalledWith("tcgplayer");
    });

    it("gets the combined cardkingdom price of the cards", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      jest.spyOn(group, "getPrice").mockReturnValue(6.49);

      expect(group.getPriceAsString("cardkingdom")).toBe("6.49");
      expect(group.getPrice).toBeCalledWith("cardkingdom");
    });

    it("returns an empty string if any individual card price returns 0", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      jest.spyOn(group, "getPrice").mockReturnValue(0);

      expect(group.getPriceAsString("cardkingdom")).toBe("");
    });

    it("fixes price to 2 decimal points", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      jest.spyOn(group, "getPrice").mockReturnValue(6.4982);

      expect(group.getPriceAsString("cardkingdom")).toBe("6.50");
    });
  });

  describe("toString", () => {
    it("renders as the raw string passed in", () => {
      const group = CardGrouping.create(["Card a", "Card b", "Card c"]);

      expect(group.toString()).toBe("Card a | Card b | Card c");
      expect(`pre: ${group} - post`).toBe(
        "pre: Card a | Card b | Card c - post"
      );
    });
  });
});
