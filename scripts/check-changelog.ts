import fs from "fs";
import saveGithubOutput from "./shared/save-github-output";

let shouldDeploy = "NO";
let deployReasonMessage = "";

const changelog = JSON.parse(
  fs.readFileSync("./frontend/static/changelog.json", "utf8")
);

const numOfAddedCombos = changelog.addedCombos.length;
const numOfDeletedCombos = changelog.deletedCombos.length;
const numOfUpdatedCombos = changelog.updatedCombos.length;

if (numOfAddedCombos > 0 || numOfDeletedCombos > 0 || numOfUpdatedCombos > 0) {
  shouldDeploy = "YES";

  if (numOfAddedCombos > 0) {
    deployReasonMessage += ` ${numOfAddedCombos} combo(s) added to the database.`;
  }
  if (numOfDeletedCombos > 0) {
    deployReasonMessage += ` ${numOfDeletedCombos} combo(s) removed from the database.`;
  }
  if (numOfUpdatedCombos > 0) {
    deployReasonMessage += ` ${numOfUpdatedCombos} combo(s) modified in the database.`;
  }
}

saveGithubOutput("should_deploy", shouldDeploy);
saveGithubOutput("deploy_reason", deployReasonMessage.trim());
