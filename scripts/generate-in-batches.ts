import { accessSync, mkdirSync, readFileSync } from "fs";
import { execSync } from "child_process";
import log from "./shared/log";

const combos = JSON.parse(
  readFileSync("frontend/public/api/combo-data.json", "utf-8")
);
const TOTAL_COMBOS = combos.length;
const BATCH_SIZE = 1000;
const NUMBER_OF_BATCHES = Math.ceil(TOTAL_COMBOS / BATCH_SIZE);

let currentIteration = 0;

log(
  `Preparing to generate ${TOTAL_COMBOS} combo pages in ${NUMBER_OF_BATCHES} batches.`
);

try {
  accessSync("dist");
  log("Dist folder already exists.", "red");
} catch (err) {
  mkdirSync("dist");
  log("Dist folder created.", "green");
}

while (currentIteration < NUMBER_OF_BATCHES) {
  const startingPoint = currentIteration * BATCH_SIZE;
  const endingPoint = startingPoint + BATCH_SIZE;
  const batchValue = `${startingPoint}to${endingPoint}`;

  log(`Generating batch ${currentIteration + 1}`);
  execSync(`COMBO_BATCH=${batchValue} npm run generate --workspace=frontend`);
  log(`Finished generating batch ${currentIteration + 1}`, "green");

  log(`Copying files from batch ${currentIteration + 1} to dist/`);
  execSync(`cp -r frontend/dist-${batchValue}/* dist/`);
  log(
    `Done copying files from batch ${currentIteration + 1} to dist/`,
    "green"
  );

  currentIteration++;
}

log("Done generating all batches", "green");
