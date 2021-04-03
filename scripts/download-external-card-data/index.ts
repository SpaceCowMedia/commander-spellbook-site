import fs from "fs";
import log from "../shared/log";
import getScryfallData from "./get-scryfall";
import getEDHRecPrices from "./get-edhrec-prices";

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

Promise.all([getScryfallData(), getEDHRecPrices()]).then((responses) => {
  const data = [] as CardData[];
  const [scryfallData, edhrecData] = responses;

  Object.keys(scryfallData).forEach((cardName) => {
    const priceData = edhrecData[cardName] || { tcgplayer: 0, cardkingdom: 0 };
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
});
