const https = require("https");
const fs = require("fs");

https
  .get(
    "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:Q&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E",
    (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        const minified = JSON.stringify(JSON.parse(data));
        fs.writeFileSync("./static/combo-data.json", minified);
      });
    }
  )
  .on("error", (err) => {
    throw err;
  });
