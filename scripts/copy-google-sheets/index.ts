import fs from "fs";
import formatApiResponse from "../../lib/api/format-api-response";
import getData from "../shared/get";
import log from "../shared/log";
import type { CommanderSpellbookAPIResponse } from "../../lib/api/types";
import { collectCardNames, collectResults } from "./collect-autocomplete";

log("Fetching Combo data from Google Sheets");

getData(
  "https://sheets.googleapis.com/v4/spreadsheets/1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA/values:batchGet?ranges=combos!A2:Q&key=AIzaSyBD_rcme5Ff37Evxa4eW5BFQZkmTbgpHew"
).then((rawData) => {
  const combos = formatApiResponse(rawData as CommanderSpellbookAPIResponse);
  const cardNames = collectCardNames(combos);
  const results = collectResults(combos);

  log("Writing /static/api/combo-data.json");
  fs.writeFileSync("./static/api/combo-data.json", JSON.stringify(rawData));
  log("/static/api/combo-data.json written", "green");

  log("Writing /autocomplete-data/cards.json");
  fs.writeFileSync("./autocomplete-data/cards.json", JSON.stringify(cardNames));
  log("/autocomplete-data/cards.json written", "green");

  log("Writing /autocomplete-data/results.json");
  fs.writeFileSync("./autocomplete-data/results.json", JSON.stringify(results));
  log("/autocomplete-data/results.json written", "green");
});
