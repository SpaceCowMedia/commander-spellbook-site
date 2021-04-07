import fs from "fs";
import path from "path";
import getExternalCardData from "@/lib/get-external-card-data";
import makeFakeCombo from "@/lib/api/make-fake-combo";

describe("normalizeCardName", () => {
  beforeEach(() => {
    fs.writeFileSync(
      path.resolve(__dirname, "..", "..", "external-card-data", "card 1.json"),
      JSON.stringify({
        name: "card 1",
        images: {
          artCrop: "https://example.com/art.png",
          oracle: "https://example.com/oracle.png",
        },
        prices: {
          tcgplayer: 123.45,
          cardkingdom: 67.89,
        },
      })
    );
  });

  it("returns card data for combo when it exists in cache", () => {
    const fakeCombo = makeFakeCombo({
      cards: ["Card 1", "Card 2"],
    });

    expect(getExternalCardData(fakeCombo.cards[0])).toEqual({
      name: "card 1",
      images: {
        artCrop: "https://example.com/art.png",
        oracle: "https://example.com/oracle.png",
      },
      prices: {
        tcgplayer: 123.45,
        cardkingdom: 67.89,
      },
    });
  });

  it("returns empty card data for combo when it does not exist in cache", () => {
    const fakeCombo = makeFakeCombo({
      cards: ["Card 1", "Card 2"],
    });

    const card2 = fakeCombo.cards[1];
    jest.spyOn(card2, "getScryfallImageUrl").mockImplementation((kind) => {
      return `https://c1.scryfall.com/${kind}.png`;
    });

    expect(getExternalCardData(card2)).toEqual({
      name: "card 2",
      images: {
        artCrop: "https://c1.scryfall.com/art_crop.png",
        oracle: "https://c1.scryfall.com/normal.png",
      },
      prices: {
        tcgplayer: 0,
        cardkingdom: 0,
      },
    });
  });
});
