import getData from "../shared/get";
import log from "../shared/log";
import normalizeCardName from "@spellbook/frontend/lib/normalize-card-name";

type Price = {
  price: number | string;
  url: string;
};
type RawEDHRECResponse = Record<
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

export default async function getEDHRECPrices(): Promise<PriceData> {
  log("Looking up price data from EDHREC");

  const rawData = (await getData("https://json.edhrec.com/static/prices").catch(
    (e) => {
      e.message =
        "Something went wrong looking up the card prices from EDHRec: " +
        e.message;
      throw e;
    }
  )) as RawEDHRECResponse;
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
