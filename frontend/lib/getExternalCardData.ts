import normalizeCardName from "lib/normalizeCardName";

const cardData = require("@/../external-data/cards.json");

const CARD_IMAGE_NAMED_BASE_URL =
  "https://api.scryfall.com/cards/named?format=image&exact=";

export type ExternalCardData = {
  isFeatured: boolean;
  images: {
    oracle: string;
    artCrop: string;
  };
  prices: {
    tcgplayer: number;
    cardkingdom: number;
  };
  aliases: string[];
  isBanned: boolean;
  isPreview: boolean;
  edhrecLink: string;
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
      aliases: [],
      isPreview: false,
      isBanned: false,
      isFeatured: false,
      images: {
        oracle: `${baseImage}normal`,
        artCrop: `${baseImage}art_crop`,
      },
      prices: {
        tcgplayer: 0,
        cardkingdom: 0,
      },
      edhrecLink: "",
    };
  }

  return {
    aliases: externalCardData.a || [],
    isBanned: externalCardData.b === 1,
    isPreview: externalCardData.s === 1,
    isFeatured: externalCardData.f === 1,
    images: {
      oracle: externalCardData.i.o,
      artCrop: externalCardData.i.a,
    },
    prices: {
      tcgplayer: externalCardData.p.t,
      cardkingdom: externalCardData.p.c,
    },
    edhrecLink: externalCardData.e,
  };
}
