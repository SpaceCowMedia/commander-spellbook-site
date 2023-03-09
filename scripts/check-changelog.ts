import fs from "fs";
import saveGithubOutput from "./shared/save-github-output";
import getCurrentGitSha from "./shared/get-current-git-sha";
import get from "./shared/get";
import type { Changelog } from "./download-data/get-combo-changelog";

let shouldDeploy = "NO";
const deployReasonMessages = [] as string[];

const changelog = JSON.parse(
  fs.readFileSync("./frontend/static/changelog.json", "utf8")
);

const numOfAddedCombos = changelog.addedCombos.length;
const numOfDeletedCombos = changelog.deletedCombos.length;
const numOfUpdatedCombos = changelog.updatedCombos.length;

if (numOfAddedCombos > 0 || numOfDeletedCombos > 0 || numOfUpdatedCombos > 0) {
  shouldDeploy = "YES";

  if (numOfAddedCombos > 0) {
    deployReasonMessages.push(
      `• ${numOfAddedCombos} combo(s) added to the database`
    );
  }
  if (numOfDeletedCombos > 0) {
    deployReasonMessages.push(
      `• ${numOfDeletedCombos} combo(s) removed from the database`
    );
  }
  if (numOfUpdatedCombos > 0) {
    deployReasonMessages.push(
      `• ${numOfUpdatedCombos} combo(s) modified in the database`
    );
  }
} else {
  deployReasonMessages.push(`• No combo data changed in database`);
}

get<Changelog>("https://commanderspellbook.com/changelog.json").then(
  (result) => {
    const currentGitSha = getCurrentGitSha();
    const oldSha = result.gitSha;

    if (oldSha !== currentGitSha) {
      shouldDeploy = "YES";
      deployReasonMessages.push(
        `• Website code updated. [View code changes](https://github.com/EDHREC/commander-spellbook-site/compare/${oldSha}...${currentGitSha})`
      );
    }

    saveGithubOutput("should_deploy", shouldDeploy);
    saveGithubOutput("deploy_reason", deployReasonMessages.join("|"));
  }
);
