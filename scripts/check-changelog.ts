import fs from "fs";
import saveGithubOutput from "./shared/save-github-output";
import getCurrentGitSha from "./shared/get-current-git-sha";
import get from "./shared/get";
import type { Changelog } from "./download-data/get-combo-changelog";

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
    deployReasonMessage += `• ${numOfAddedCombos} combo(s) added to the database\n`;
  }
  if (numOfDeletedCombos > 0) {
    deployReasonMessage += `• ${numOfDeletedCombos} combo(s) removed from the database\n`;
  }
  if (numOfUpdatedCombos > 0) {
    deployReasonMessage += `• ${numOfUpdatedCombos} combo(s) modified in the database\n`;
  }
} else {
  deployReasonMessage += `• No combo data changed in database\n`;
}

get<Changelog>("https://commanderspellbook.com/changelog.json").then(
  (result) => {
    const currentGitSha = getCurrentGitSha();
    const oldSha = result.gitSha;

    if (oldSha !== currentGitSha) {
      shouldDeploy = "YES";
      deployReasonMessage += `• Website code updated. [View code changes](https://github.com/commander-spellbook/website-v2/compare/${oldSha}...${currentGitSha}) to the website\n`;
    }

    saveGithubOutput("should_deploy", shouldDeploy);
    saveGithubOutput("deploy_reason", deployReasonMessage.trim());
  }
);
