import normalizeCardName from "@/lib/normalize-card-name";
import type Card from "@/lib/api/models/card";

type ExternalCardData = {
  name: string;
  images: {
    oracle: string;
    artCrop: string;
  };
  prices: {
    tcgplayer: number;
    cardkingdom: number;
  };
};

export default function getExternalCardData(card: Card): ExternalCardData {
  const name = normalizeCardName(card.name);
  let externalCardData: ExternalCardData;

  try {
    externalCardData = require(`../external-card-data/${name}.json`);
  } catch (err) {
    externalCardData = {
      name,
      images: {
        artCrop: card.getScryfallImageUrl("art_crop"),
        oracle: card.getScryfallImageUrl("normal"),
      },
      prices: {
        tcgplayer: 0,
        cardkingdom: 0,
      },
    };
  }

  return externalCardData;
}
