import fs from "fs";
import getData from "../shared/get";
import log from "../shared/log";

log("Looking up price data from EDHRec");

getData("https://edhrec.com/api/prices/").then((data) => {
  const minified = JSON.stringify(data);
  fs.writeFileSync("./static/api/price-data.json", minified);
  log("/static/api/price-data.json written", "green");
});
