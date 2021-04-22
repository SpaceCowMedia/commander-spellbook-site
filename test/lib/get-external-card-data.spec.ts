import getExternalCardData from "@/lib/get-external-card-data";

describe("getExternalCardData", () => {
  it("returns card data for combo when it exists in cache", () => {
    expect(getExternalCardData("Sydri, Galvanic Genius")).toEqual({
      images: {
        artCrop: expect.stringContaining("scryfall.com/file"),
        oracle: expect.stringContaining("scryfall.com/file"),
      },
      prices: {
        tcgplayer: expect.any(Number),
        cardkingdom: expect.any(Number),
      },
    });
  });

  it("returns empty card data for combo when it does not exist in cache", () => {
    expect(getExternalCardData("unknown card name")).toEqual({
      images: {
        artCrop:
          "https://api.scryfall.com/cards/named?format=image&exact=unknown%20card%20name&version=art_crop",
        oracle:
          "https://api.scryfall.com/cards/named?format=image&exact=unknown%20card%20name&version=normal",
      },
      prices: {
        tcgplayer: 0,
        cardkingdom: 0,
      },
    });
  });
});
