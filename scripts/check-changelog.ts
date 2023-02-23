import fs from "fs";

let result = "SHOULD_DEPLOY";

const changelog = JSON.parse(
  fs.readFileSync("./frontend/static/changelog.json", "utf8")
);

if (
  changelog.addedCombos.length === 0 &&
  changelog.deletedCombos.length === 0 &&
  changelog.updatedCombos.length === 0
) {
  result = "NO_COMBO_CHANGES";
}

process.env.GITHUB_OUTPUT =
  process.env.GITHUB_OUTPUT +
  `
result=${result}`;

console.log("Deploy state: ", result);
