import fs from "fs";
import log from "../shared/log";
import getScryfallData from "./get-scryfall";
import getEDHRecPrices from "./get-edhrec-prices";
import getGoogleSheetsComboData from "./get-google-sheets-data";
import { collectCardNames, collectResults } from "./collect-autocomplete";

type CardData = {
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

Promise.all([
  getGoogleSheetsComboData(),
  getScryfallData(),
  getEDHRecPrices(),
]).then((responses) => {
  const data = [] as CardData[];
  const [compressedData, scryfallData, edhrecData] = responses;
  const cardNames = collectCardNames(compressedData);
  const results = collectResults(compressedData);

  log("Writing /autocomplete-data/cards.json");
  fs.writeFileSync("./autocomplete-data/cards.json", JSON.stringify(cardNames));
  log("/autocomplete-data/cards.json written", "green");

  log("Writing /autocomplete-data/results.json");
  fs.writeFileSync("./autocomplete-data/results.json", JSON.stringify(results));
  log("/autocomplete-data/results.json written", "green");

  Object.keys(scryfallData).forEach((cardName) => {
    const priceData = edhrecData[cardName] || {
      prices: { tcgplayer: 0, cardkingdom: 0 },
    };
    const sfData = scryfallData[cardName];

    data.push({
      name: cardName,
      ...priceData,
      ...sfData,
    });
  });

  data.forEach((cardData) => {
    const minified = JSON.stringify(cardData);
    const fileName = `/external-card-data/${cardData.name}.json`;

    fs.writeFile(`.${fileName}`, minified, (err) => {
      if (err) {
        log(`Something went wrong writing ${fileName}`, "red");
        return;
      }
      log(`${fileName} written`, "green");
    });
  });

  log("Writing /static/api/combo-data.json");
  fs.writeFileSync(
    "./static/api/combo-data.json",
    JSON.stringify(compressedData)
  );
  log("/static/api/combo-data.json written", "green");
});
