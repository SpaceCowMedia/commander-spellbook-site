import fs from "fs";
import normalizeCardName from "../../lib/normalize-card-name";
import log from "../shared/log";
import getScryfallData from "./get-scryfall";
import getEDHRecPrices from "./get-edhrec-prices";
import getGoogleSheetsComboData from "./get-google-sheets-data";
import { collectCardNames, collectResults } from "./collect-autocomplete";

type CardData = {
  i: {
    // images
    o: string; // oracle
    a: string; // art
  };
  p: {
    // prices
    t: number; // tcgplayer
    c: number; // cardkingdom
  };
};

Promise.all([
  getGoogleSheetsComboData(),
  getScryfallData(),
  getEDHRecPrices(),
]).then((responses) => {
  const cardData: Record<string, CardData> = {};
  const [compressedData, scryfallData, edhrecData] = responses;
  const cardNames = collectCardNames(compressedData);
  const results = collectResults(compressedData);

  log("Writing /autocomplete-data/cards.json");
  fs.writeFileSync("./autocomplete-data/cards.json", JSON.stringify(cardNames));
  log("/autocomplete-data/cards.json written", "green");

  log("Writing /autocomplete-data/results.json");
  fs.writeFileSync("./autocomplete-data/results.json", JSON.stringify(results));
  log("/autocomplete-data/results.json written", "green");

  cardNames.forEach((autocompleteOption) => {
    const name = normalizeCardName(autocompleteOption.label);
    const sfData = scryfallData[name];
    const priceData = edhrecData[name] || {
      prices: { tcgplayer: 0, cardkingdom: 0 },
    };

    try {
      cardData[name] = {
        p: {
          t: priceData.prices.tcgplayer,
          c: priceData.prices.cardkingdom,
        },
        i: {
          o: sfData.images.oracle,
          a: sfData.images.artCrop,
        },
      };
    } catch (e) {
      log(
        `"${name}" could not be found in Scryfall's data. It's possible the name is misspelled. Skipping it when creating card data.`,
        "red"
      );
    }
  });

  log("Writing /external-card-data/cards.json");
  fs.writeFileSync("./external-card-data/cards.json", JSON.stringify(cardData));
  log("/external-card-data/cards.json written", "green");

  log("Writing /static/api/combo-data.json");
  fs.writeFileSync(
    "./static/api/combo-data.json",
    JSON.stringify(compressedData)
  );
  log("/static/api/combo-data.json written", "green");
});
