const https = require("https");
const fs = require("fs");

const file = fs.createWriteStream("./static/combo-data.json");

https.get(
  "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:Q&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E",
  (response) => {
    response.pipe(file);
  }
);
