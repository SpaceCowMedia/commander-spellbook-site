import getData from "../shared/get";
import log from "../shared/log";
import normalizeCardName from "../../lib/normalize-card-name";

log("Looking up price data from EDHRec");

type Price = {
  price: number | string;
  url: string;
};
type RawEDHRecResponse = Record<
  string,
  {
    cardkingdom: Price;
    tcgplayer: Price;
    coolstuffinc: Price;
    cardmarket: Price;
    cardhoarder: Price;
  }
>;
type PriceData = Record<
  string,
  {
    prices: {
      tcgplayer: number;
      cardkingdom: number;
    };
  }
>;

export default async function getEDHRecPrices(): Promise<PriceData> {
  const rawData = (await getData(
    "https://edhrec.com/api/prices/"
  )) as RawEDHRecResponse;
  const cardData = {} as PriceData;

  Object.keys(rawData).forEach((cardName) => {
    cardData[normalizeCardName(cardName)] = {
      prices: {
        tcgplayer: Number(rawData[cardName]?.tcgplayer?.price || 0),
        cardkingdom: Number(rawData[cardName]?.cardkingdom?.price || 0),
      },
    };
  });

  return cardData;
}
