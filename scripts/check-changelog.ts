import fs from "fs";

let result = "SHOULD_NOT_DEPLOY";
const GITHUB_OUTPUT_LOCATION = process.env.GITHUB_OUTPUT;

if (!GITHUB_OUTPUT_LOCATION) {
  throw new Error(
    "Could not find the GITHUB_OUTPUT file. Not in the Github Actions Environment. Abort!"
  );
}

const GITHUB_OUTPUT = fs.readFileSync(GITHUB_OUTPUT_LOCATION, "utf8");

const changelog = JSON.parse(
  fs.readFileSync("./frontend/static/changelog.json", "utf8")
);

if (
  changelog.addedCombos.length > 0 ||
  changelog.deletedCombos.length > 0 ||
  changelog.updatedCombos.length > 0
) {
  result = "COMBO_DATA_CHANGED";
}

fs.writeFileSync(
  GITHUB_OUTPUT_LOCATION,
  `${GITHUB_OUTPUT}
result=${result}`
);
