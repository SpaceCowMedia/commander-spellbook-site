const https = require("https");
const fs = require("fs");

const file = fs.createWriteStream("./static/price-data.json");

https.get("https://edhrec.com/api/prices/", (response) => {
  response.pipe(file);
});
