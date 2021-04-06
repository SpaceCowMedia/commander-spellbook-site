import fs from "fs";
import formatApiResponse from "../../lib/api/format-api-response";
import getData from "../shared/get";
import log from "../shared/log";
import { collectCardNames, collectResults } from "./collect-autocomplete";

import type {
  CommanderSpellbookAPIResponse,
  FormattedApiResponse,
} from "../../lib/api/types";

log("Fetching Combo data from Google Sheets");

getData(
  "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:Q&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E"
).then((rawData) => {
  const combos = formatApiResponse(rawData as CommanderSpellbookAPIResponse);
  const cardNames = collectCardNames(combos);
  const results = collectResults(combos);

  log("Writing /static/api/combo-data.json");
  fs.writeFileSync("./static/api/combo-data.json", JSON.stringify(rawData));
  log("/static/api/combo-data.json written", "green");

  log("Writing /static/api/card-names.json");
  fs.writeFileSync("./static/api/card-names.json", JSON.stringify(cardNames));
  log("/static/api/card-names.json written", "green");

  log("Writing /static/api/results.json");
  fs.writeFileSync("./static/api/results.json", JSON.stringify(results));
  log("/static/api/results.json written", "green");
});
