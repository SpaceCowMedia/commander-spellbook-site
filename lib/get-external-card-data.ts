import normalizeCardName from "@/lib/normalize-card-name";

const cardData = require("../external-card-data/cards.json");

const CARD_IMAGE_NAMED_BASE_URL =
  "https://api.scryfall.com/cards/named?format=image&exact=";

export type ExternalCardData = {
  images: {
    oracle: string;
    artCrop: string;
  };
  prices: {
    tcgplayer: number;
    cardkingdom: number;
  };
};

export default function getExternalCardData(
  cardName: string
): ExternalCardData {
  const name = normalizeCardName(cardName);
  const externalCardData = cardData[name];

  if (!externalCardData) {
    const baseImage = `${CARD_IMAGE_NAMED_BASE_URL}${encodeURIComponent(
      cardName
    )}&version=`;

    return {
      images: {
        oracle: `${baseImage}normal`,
        artCrop: `${baseImage}art_crop`,
      },
      prices: {
        tcgplayer: 0,
        cardkingdom: 0,
      },
    };
  }

  return {
    images: {
      oracle: externalCardData.i.o,
      artCrop: externalCardData.i.a,
    },
    prices: {
      tcgplayer: externalCardData.p.t,
      cardkingdom: externalCardData.p.c,
    },
  };
}
