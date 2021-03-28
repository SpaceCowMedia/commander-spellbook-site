import fs from "fs";
import getData from "../shared/get";
import log from "../shared/log";

log("Fetching Combo data from Google Sheets");

getData(
  "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:Q&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E"
).then((data) => {
  const minified = JSON.stringify(data);
  fs.writeFileSync("./static/combo-data.json", minified);
  log("/static/combo-data.json written", "green");
});
